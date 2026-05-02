import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreVertical, Mail, Phone, Calendar, CheckCircle2, XCircle, Plus, Trash2, UserPlus, Eye, Shield, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { Student } from '../types';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');

  const fetchStudents = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Fetch students error:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteStudent = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Student deleted successfully!');
        fetchStudents();
      }
    } catch (error) {
      console.error("Delete student error:", error);
    }
    setActiveMenu(null);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await fetch(`/api/admin/students/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.info(`Student status updated to ${newStatus}.`);
        fetchStudents();
      }
    } catch (error) {
      console.error("Toggle status error:", error);
    }
    setActiveMenu(null);
  };

  const verifyStudent = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/students/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Student verified successfully!');
        fetchStudents();
      }
    } catch (error) {
      console.error("Verify student error:", error);
    }
    setActiveMenu(null);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.id.toString().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' || s.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#385723]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Users className="text-gray-400 mt-1 shrink-0" size={24} />
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#385723] tracking-tight">Student Management</h1>
            <p className="text-gray-400 text-xs lg:text-sm">View and manage registered student profiles.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#4ade80] w-full sm:w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <select 
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#4ade80]"
          >
            <option value="All">All Grades</option>
            {['Pre-School', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-2xl lg:rounded-3xl border border-gray-200 shadow-xl bg-white">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-5 text-xs font-bold text-gray-600">ID</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Student Name & Grade</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Contact Info</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Verification</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Status</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((stu) => (
              <tr key={stu.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-6 text-xs font-bold text-gray-400">{stu.id}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">
                      {stu.name.charAt(0)}
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-bold text-gray-800 leading-none">{stu.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-black leading-none tracking-wider mt-[1px]">{stu.grade}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 space-y-[1px]">
                  <div className="flex items-center gap-2 text-xs text-gray-500 leading-none">
                    <Mail size={14} className="text-gray-400" />
                    {stu.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 leading-none">
                    <Phone size={14} className="text-gray-400" />
                    {stu.phone}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stu.is_verified ? 'bg-sky-500' : 'bg-amber-500'}`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${stu.is_verified ? 'text-sky-600' : 'text-amber-600'}`}>
                      {stu.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <button 
                    onClick={() => toggleStatus(stu.id, stu.status)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-2 h-2 rounded-full ${stu.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${stu.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                      {stu.status}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-6 text-right relative">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => {
                        setSelectedStudent(stu);
                        setIsDetailsModalOpen(true);
                      }}
                      className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === stu.id ? null : stu.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === stu.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 py-2"
                            >
                              <button 
                                onClick={() => toggleStatus(stu.id, stu.status)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                {stu.status === 'Active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                {stu.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                              {!stu.is_verified && (
                                <button 
                                  onClick={() => verifyStudent(stu.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 flex items-center gap-2"
                                >
                                  <CheckCircle2 size={16} /> Verify Email
                                </button>
                              )}
                              <div className="h-px bg-gray-100 my-1" />
                              <button 
                                onClick={() => handleDeleteStudent(stu.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Delete Student
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDetailsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
                <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-400 font-medium">{selectedStudent.id}</p>
                  <span className={`mt-2 inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${selectedStudent.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{selectedStudent.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Status</p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 size={16} className={selectedStudent.is_verified ? 'text-sky-500' : 'text-amber-500'} />
                    <span className={`text-sm font-bold ${selectedStudent.is_verified ? 'text-sky-600' : 'text-amber-600'}`}>
                      {selectedStudent.is_verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{selectedStudent.phone}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grade Level</p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{selectedStudent.grade}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{selectedStudent.joined}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Live</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Registered Students</p>
            <p className="text-3xl font-black text-gray-800">{students.length.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Accounts</p>
            <p className="text-3xl font-black text-gray-800">{students.filter(s => s.status === 'Active').length.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <XCircle size={24} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inactive Accounts</p>
            <p className="text-3xl font-black text-gray-800">{students.filter(s => s.status === 'Inactive').length.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
