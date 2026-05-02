import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, User as UserIcon, Calendar, MapPin, Phone, Lock, X, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ProfileProps {
  user: UserType | null;
  onLogout: () => void;
  onUpdate: (user: UserType) => void;
}

interface UserProfile extends UserType {
  id: number;
  mobile: string;
  status: string;
  student_id: string;
  created_at: string;
  reservations_count: number;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    grade: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        setEditData({
          name: data.name,
          grade: data.grade || ''
        });
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) return null;

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match!");
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setIsChangingPassword(false);
        setPasswordData({ current: '', new: '', confirm: '' });
        toast.success("Password changed successfully! Please login again if you logout.");
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        fetchProfile();
        onUpdate({
          ...user!,
          name: editData.name,
          grade: editData.grade
        });
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#385723]" size={48} />
      </div>
    );
  }

  const displayUser = profile || {
    ...user,
    mobile: '+63 912 345 6789',
    student_id: user.role === 'admin' ? 'ADM-2025-001' : 'STU-2025-088',
    status: 'Active',
    created_at: new Date().toISOString(),
    reservations_count: 0
  };

  const memberSince = new Date(displayUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#4ade80]/20 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
          <UserIcon size={48} className="text-[#385723]" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl lg:text-5xl font-serif text-[#2d4a1e] font-bold tracking-tight leading-[0.85]">{displayUser.name}</h1>
          <div className="mt-[-2px]">
            <span className={`px-2 py-0 rounded text-[9px] font-black uppercase tracking-[0.15em] ${
              displayUser.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-[#4ade80]/20 text-[#385723]'
            }`}>
              {displayUser.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl lg:rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                {displayUser.role === 'admin' ? 'Admin Personal Information' : 'Personal Information'}
              </h2>
              {displayUser.role === 'student' && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-bold text-[#385723] hover:underline"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text"
                      value={editData.name}
                      onChange={e => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4ade80]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grade Level</label>
                    <select
                      value={editData.grade}
                      onChange={e => setEditData({...editData, grade: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4ade80]"
                      required
                    >
                      <option value="">Select Grade</option>
                      {['Pre-School', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-[#385723] text-white font-bold rounded-xl hover:bg-[#2d4a1e] disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        name: displayUser.name,
                        grade: displayUser.grade || ''
                      });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {displayUser.role === 'admin' ? 'Admin Name' : 'User name'}
                  </p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <UserIcon size={18} className="text-gray-400" />
                    <span className="font-medium">{displayUser.name}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {displayUser.role === 'admin' ? 'Professional Email' : 'Email Address'}
                  </p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={18} className="text-gray-400" />
                    <span className="font-medium">{displayUser.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {displayUser.role === 'admin' ? 'Contact Number' : 'Phone Number'}
                  </p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={18} className="text-gray-400" />
                    <span className="font-medium">{displayUser.mobile || 'Not provided'}</span>
                  </div>
                </div>
                {displayUser.role === 'student' && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grade Level</p>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield size={18} className="text-gray-400" />
                      <span className="font-medium">{displayUser.grade || 'N/A'}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayUser.role === 'admin' ? 'Employee ID' : 'Student ID'}</p>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Shield size={18} className="text-gray-400" />
                    <span className="font-medium">{displayUser.student_id}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl lg:rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 border-b border-gray-100 pb-4">Account Settings</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="w-full text-left px-6 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-gray-400" />
                  <span className="font-bold text-gray-700">Change Password</span>
                </div>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-[#385723] rounded-2xl lg:rounded-3xl p-8 text-white shadow-xl space-y-6">
            <h2 className="text-xl font-bold border-b border-white/20 pb-4">Quick Stats</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Member Since</span>
                <span className="font-bold">{memberSince}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Account Status</span>
                <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest">{displayUser.status}</span>
              </div>
            </div>
          </section>

          <button 
            onClick={onLogout}
            className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangingPassword && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isUpdating && setIsChangingPassword(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                <button 
                  onClick={() => setIsChangingPassword(false)}
                  disabled={isUpdating}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Password</label>
                  <div className="relative">
                    <input 
                      required
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.current}
                      onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#4ade80] transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Password</label>
                  <div className="relative">
                    <input 
                      required
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.new}
                      onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#4ade80] transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      required
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#4ade80] transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-4 bg-[#385723] text-white font-bold rounded-xl hover:bg-[#2d4a1e] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
