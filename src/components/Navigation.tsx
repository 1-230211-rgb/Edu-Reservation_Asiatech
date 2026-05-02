import React, { useState } from 'react';
import { LayoutDashboard, Home, ShoppingBag, Info, HelpCircle, FileText, LogOut, Bell, Menu, X, Users, Package, User as UserIcon, Wrench, ShieldCheck, ClipboardList, History } from 'lucide-react';
import { Page, UserRole, User } from '../types';

interface SidebarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, onLogout, isOpen, onClose, userRole = 'student' }) => {
  const studentItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'track', label: 'Track Reservations', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'policies', label: 'Policies/Guidelines', icon: ShieldCheck },
  ];

  const adminItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-reservations', label: 'Reservations', icon: ShoppingBag },
    { id: 'admin-inventory', label: 'Inventory', icon: Package },
    { id: 'admin-students', label: 'Students', icon: Users },
    { id: 'admin-system-logs', label: 'System Logs', icon: History },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'policies', label: 'Policies/Guidelines', icon: ShieldCheck },
  ];

  const menuItems = userRole === 'admin' ? adminItems : studentItems;

  const handlePageSelect = (page: Page) => {
    setPage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#e2efda] h-full flex flex-col border-r border-gray-200 z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/school-logo/100/100';
                }}
              />
            </div>
            <span className="font-bold text-xl text-[#385723]">EduReserve</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-700 hover:bg-gray-200 rounded-full">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handlePageSelect(item.id as Page)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-gray-200 text-gray-900 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export const Header: React.FC<{ setPage: (page: Page) => void; onMenuOpen: () => void; user?: User | null; notificationCount?: number }> = ({ setPage, onMenuOpen, user, notificationCount = 0 }) => {
  return (
    <header className="h-16 bg-[#e2efda] flex items-center justify-between lg:justify-end px-4 lg:px-8 gap-6 border-b border-gray-200">
      <button 
        onClick={onMenuOpen}
        className="lg:hidden p-2 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={() => setPage('notifications')}
          className="relative p-2 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Bell size={24} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#e2efda] text-[10px] text-white font-bold flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
        <div 
          onClick={() => setPage('profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="text-right hidden sm:flex flex-col items-end h-10 pt-[6px]">
            <p className="text-xs font-bold text-gray-800 group-hover:text-[#385723] transition-colors leading-none tracking-tight">{user?.name}</p>
            <p className="text-[9px] font-black text-[#385723]/70 uppercase tracking-[0.05em] leading-none mt-[5px]">{user?.role}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-105 ${user?.role === 'admin' ? 'bg-[#385723]' : 'bg-blue-600'}`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
