import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, History, Calendar, User, Activity } from 'lucide-react';
import { AuditLog } from '../types';

export const AdminSystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('/api/admin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Fetch logs error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.admin_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <History className="text-gray-400 mt-1 shrink-0" size={24} />
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#385723] tracking-tight">System Audit Logs</h1>
            <p className="text-gray-400 text-xs lg:text-sm">Review administrative actions and system events for security monitoring.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search action, details, admin..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#4ade80] w-full sm:w-80"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl lg:rounded-3xl border border-gray-200 shadow-xl bg-white">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Timestamp</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Administrator</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Action Type</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600">Detailed Record</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-600 text-right">Entity Info</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6">
                    <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                  </td>
                </tr>
              ))
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-bold text-gray-800 leading-none">
                        {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mt-1">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <User size={14} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{log.admin_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      log.action.includes('DELETE') ? 'bg-red-100 text-red-600' :
                      log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-600' :
                      log.action.includes('ADD') ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-medium">
                    <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                      {log.details}
                    </p>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-[#385723] uppercase tracking-widest opacity-60">
                        {log.entity_type || 'SYSTEM'}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold">ID: {log.entity_id || 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldCheck size={48} className="text-gray-100" />
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No matching logs found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
