import React, { useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkAsRead }) => {
  const handleMarkAsRead = (id: string) => {
    onMarkAsRead(id);
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

  const newNotifications = notifications.filter(n => n.status === 'Unread');
  const earlierNotifications = notifications.filter(n => n.status === 'Read');

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12">
      <h1 className="text-3xl lg:text-5xl font-serif text-[#2d4a1e] font-bold tracking-tight">Notification</h1>

      <div className="space-y-12 lg:space-y-16">
        {newNotifications.length > 0 && (
          <section className="space-y-4 lg:space-y-6">
            <h2 className="text-[8px] font-medium text-gray-400 uppercase tracking-widest pb-0.5 px-1 opacity-40 scale-[0.6] origin-left">NEW</h2>
            <div className="overflow-x-auto rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm bg-white">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 lg:px-12 py-4 text-[10px] lg:text-[11px] font-black text-gray-400 uppercase tracking-widest">DATE</th>
                    <th className="px-6 lg:px-12 py-4 text-[10px] lg:text-[11px] font-black text-gray-400 uppercase tracking-widest">MESSAGE</th>
                    <th className="px-6 lg:px-12 py-4 text-[10px] lg:text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {newNotifications.map((notif) => (
                    <tr 
                      key={notif.id} 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors bg-gray-50/30 cursor-pointer"
                    >
                      <td className="px-6 lg:px-12 py-6 lg:py-8 text-xs lg:text-sm font-bold text-gray-600 whitespace-nowrap">{formatDate(notif.date)}</td>
                      <td className="px-6 lg:px-12 py-6 lg:py-8 text-xs lg:text-sm font-bold text-gray-900 leading-relaxed uppercase tracking-tight">
                        {notif.message}
                      </td>
                      <td className="px-6 lg:px-12 py-6 lg:py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] lg:text-xs font-black text-red-500 uppercase tracking-widest">Unread</span>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Subtle Section Divider */}
        {newNotifications.length > 0 && earlierNotifications.length > 0 && (
          <div className="h-px bg-gray-50 w-full" />
        )}

        <section className="space-y-4 lg:space-y-6">
          <h2 className="text-[8px] font-medium text-gray-400 uppercase tracking-widest pb-0.5 px-1 opacity-40 scale-[0.6] origin-left">EARLIER</h2>
          <div className="overflow-x-auto rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm bg-white">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 lg:px-12 py-4 text-[10px] lg:text-[11px] font-black text-gray-400 uppercase tracking-widest">DATE</th>
                  <th className="px-6 lg:px-12 py-4 text-[10px] lg:text-[11px] font-black text-gray-400 uppercase tracking-widest">MESSAGE</th>
                  <th className="px-6 lg:px-12 py-4 text-[10px] lg:text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">STATUS</th>
                </tr>
              </thead>
              <tbody>
                  {earlierNotifications.map((notif) => (
                  <tr key={notif.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 lg:px-12 py-6 lg:py-8 text-xs lg:text-sm font-bold text-gray-600 whitespace-nowrap">{formatDate(notif.date)}</td>
                    <td className="px-6 lg:px-12 py-6 lg:py-8 text-xs lg:text-sm font-medium text-gray-700 leading-relaxed">
                      {notif.message}
                    </td>
                    <td className="px-6 lg:px-12 py-6 lg:py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest">Read</span>
                        <CheckCircle2 size={14} className="text-gray-300" />
                      </div>
                    </td>
                  </tr>
                ))}
                {earlierNotifications.length === 0 && newNotifications.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                      No notifications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
