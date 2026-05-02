import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, CheckCircle2, XCircle, Package, Clock, MoreVertical, Check } from 'lucide-react';
import { Reservation } from '../types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface AdminReservationsProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: Reservation['status'], reason?: string) => void;
}

export const AdminReservations: React.FC<AdminReservationsProps> = ({ reservations, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Ready for Pickup' | 'Picked Up' | 'Rejected' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingRes, setViewingRes] = useState<Reservation | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredReservations = reservations.filter(res => {
    const matchesTab = activeTab === 'All' || res.status === activeTab;
    const matchesSearch = res.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         res.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-600';
      case 'Approved': return 'bg-blue-100 text-blue-600';
      case 'Ready for Pickup': return 'bg-indigo-100 text-indigo-600';
      case 'Picked Up': return 'bg-green-100 text-green-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      case 'Cancelled': return 'bg-gray-100 text-gray-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleStatusUpdate = (id: string, status: Reservation['status'], reason?: string) => {
    onUpdateStatus(id, status, reason);
    toast.success(`Reservation ${id} marked as ${status}`);
    if (status === 'Rejected') {
      setRejectingId(null);
      setRejectionReason('');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const d = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const t = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `${d} ${t}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatSize = (size: string) => {
    switch (size) {
      case 'S': return 'Small';
      case 'M': return 'Medium';
      case 'L': return 'Large';
      default: return size;
    }
  };

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <ShoppingBag className="text-gray-400 mt-1 shrink-0" size={24} />
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#385723] tracking-tight">Manage Reservations</h1>
            <p className="text-gray-400 text-xs lg:text-sm">Review and update student uniform reservations.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search student or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#4ade80] w-full sm:w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {['All', 'Pending', 'Approved', 'Ready for Pickup', 'Picked Up', 'Rejected', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-[#385723] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reservations Table */}
      <div className="overflow-x-auto rounded-2xl lg:rounded-3xl border border-gray-200 shadow-xl bg-white">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-5 text-xs font-bold text-gray-600">ID</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Student</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Item Details</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Date</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Status</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res) => (
              <tr key={res.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-6 text-xs font-bold text-gray-400">{res.id}</td>
                <td className="px-6 py-6">
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-800 leading-none">{res.studentName}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-black leading-none tracking-wider mt-[1px]">{res.studentGrade}</p>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <p className="text-sm font-medium text-gray-700">{res.itemName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    {res.gender}
                  </p>
                  <p className="text-[10px] text-gray-400">Size: {formatSize(res.size) || 'N/A'} | Qty: {res.quantity}</p>
                </td>
                <td className="px-6 py-6 text-xs text-gray-600">{formatDate(res.dateReserved)}</td>
                <td className="px-6 py-6">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusStyle(res.status)}`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    {res.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(res.id, 'Approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Approve"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <button 
                          onClick={() => setRejectingId(res.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Reject"
                        >
                          <XCircle size={20} />
                        </button>
                      </>
                    )}
                    {res.status === 'Approved' && (
                      <button 
                        onClick={() => handleStatusUpdate(res.id, 'Ready for Pickup')}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                        title="Mark as Ready for Pickup"
                      >
                        <Package size={20} />
                      </button>
                    )}
                    {res.status === 'Ready for Pickup' && (
                      <button 
                        onClick={() => handleStatusUpdate(res.id, 'Picked Up')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Mark as Picked Up"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === res.id ? null : res.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {openMenuId === res.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-2 overflow-hidden">
                          <button 
                            onClick={() => {
                              setViewingRes(res);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Clock size={16} /> View Details
                          </button>
                          {res.status === 'Ready for Pickup' && (
                            <button 
                              onClick={() => {
                                handleStatusUpdate(res.id, 'Cancelled');
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <XCircle size={16} /> Cancel Reservation
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReservations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                  No reservations found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Detail Modal */}
      <AnimatePresence>
        {viewingRes && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingRes(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#385723]">Reservation Details</h2>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{viewingRes.id}</p>
                  </div>
                  <button onClick={() => setViewingRes(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <XCircle size={24} className="text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Name</p>
                    <p className="font-bold text-gray-800">{viewingRes.studentName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grade Level</p>
                    <p className="font-bold text-gray-800">{viewingRes.studentGrade}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Name</p>
                    <p className="font-bold text-gray-800">{viewingRes.itemName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</p>
                    <p className="font-bold text-gray-800">{viewingRes.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</p>
                    <p className="font-bold text-gray-800">{formatSize(viewingRes.size) || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</p>
                    <p className="font-bold text-gray-800">{viewingRes.quantity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Reserved</p>
                    <p className="font-bold text-gray-800">{formatDate(viewingRes.dateReserved)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Status</p>
                    <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusStyle(viewingRes.status)}`}>
                      {viewingRes.status}
                    </span>
                  </div>
                  {viewingRes.rejectionReason && (
                    <div className="col-span-2 space-y-1 p-4 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Reason for Rejection</p>
                      <p className="text-sm text-red-700 font-medium">{viewingRes.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button 
                    onClick={() => setViewingRes(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  {viewingRes.status === 'Ready for Pickup' && (
                    <button 
                      onClick={() => {
                        handleStatusUpdate(viewingRes.id, 'Cancelled');
                        setViewingRes(null);
                      }}
                      className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-red-600">Reject Reservation</h2>
                  <p className="text-gray-400 text-sm">Please provide a reason for rejecting reservation {rejectingId}.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reason</label>
                    <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g., Size out of stock, incorrect details..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 min-h-[120px] text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setRejectingId(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!rejectionReason.trim()}
                    onClick={() => handleStatusUpdate(rejectingId, 'Rejected', rejectionReason)}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
