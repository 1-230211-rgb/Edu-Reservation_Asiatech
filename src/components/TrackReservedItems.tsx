import React from 'react';
import { Monitor, MapPin, Calendar, Clock, AlertTriangle, CheckCircle2, Package, Check, XCircle } from 'lucide-react';
import { Reservation } from '../types';

interface TrackReservedItemsProps {
  reservations: Reservation[];
  onCancel: (id: string) => void;
}

export const TrackReservedItems: React.FC<TrackReservedItemsProps> = ({ reservations, onCancel }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 size={16} className="text-blue-500" />;
      case 'Ready for Pickup': return <Package size={16} className="text-indigo-600" />;
      case 'Picked Up': return <Check size={16} className="text-green-600" />;
      case 'Rejected': return <XCircle size={16} className="text-red-500" />;
      case 'Cancelled': return <XCircle size={16} className="text-gray-400" />;
      case 'Pending': return <Clock size={16} className="text-amber-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-blue-700 bg-blue-50';
      case 'Ready for Pickup': return 'text-indigo-700 bg-indigo-50';
      case 'Picked Up': return 'text-green-700 bg-green-50';
      case 'Rejected': return 'text-red-700 bg-red-50';
      case 'Cancelled': return 'text-gray-700 bg-gray-100';
      case 'Pending': return 'text-amber-700 bg-amber-50';
      default: return 'text-gray-700 bg-gray-50';
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
    <div className="p-4 lg:p-6 space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <Monitor className="text-gray-400 mt-1 shrink-0" size={24} />
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#385723] tracking-tight flex items-center gap-2">
              Track Reserved Items
            </h1>
            <p className="text-gray-400 text-xs lg:text-sm">View and monitor the status of your reserved school uniforms and accessories.</p>
          </div>
        </div>
        <div className="bg-white px-4 lg:px-6 py-2 lg:py-3 rounded-2xl lg:rounded-3xl border-2 border-[#e2efda] shadow-sm flex flex-col items-center justify-center min-w-[100px] lg:min-w-[140px]">
          <p className="text-[8px] lg:text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-0.5 lg:mb-1">Total Reservations</p>
          <p className="text-2xl lg:text-4xl font-black text-[#385723] leading-none">{reservations.length}</p>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-8">
        <div className="overflow-x-auto rounded-2xl lg:rounded-3xl border border-gray-200 shadow-xl bg-white">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600">Reservation ID</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600">Item Name</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600">Size</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600 text-center">Quantity</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600">Date Reserved</th>
                 <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600">Status</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600">Estimated Pickup</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm font-bold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 lg:px-8 py-4 lg:py-6 text-xs lg:text-sm font-bold text-gray-400">{res.id}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-6 text-xs lg:text-sm font-medium text-gray-700">{res.itemName}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-6 text-xs lg:text-sm text-gray-600">{formatSize(res.size) || 'N/A'}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-6 text-xs lg:text-sm text-gray-600 text-center font-bold">{res.quantity}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-6 text-xs lg:text-sm text-gray-600">{formatDate(res.dateReserved)}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-6">
                    <div className="flex flex-col gap-1">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${getStatusColor(res.status)}`}>
                        {getStatusIcon(res.status)}
                        <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider">{res.status}</span>
                      </div>
                      {res.status === 'Rejected' && res.rejectionReason && (
                        <p className="text-[9px] text-red-400 italic font-medium max-w-[150px] leading-tight mt-1">
                          Reason: {res.rejectionReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-4 lg:py-6 text-xs lg:text-sm text-gray-600 font-medium">
                    {res.status === 'Ready for Pickup' ? 'Available Now' : (res.estimatedPickup || 'TBA')}
                  </td>
                  <td className="px-6 lg:px-8 py-4 lg:py-6 text-right">
                    {res.status === 'Pending' && (
                      <button 
                        onClick={() => onCancel(res.id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                    You have no active reservations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-4 lg:gap-6 text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-1"><Clock size={10} className="text-amber-500" /> Pending</div>
          <div className="flex items-center gap-1"><CheckCircle2 size={10} className="text-blue-500" /> Approved</div>
          <div className="flex items-center gap-1"><Package size={10} className="text-indigo-600" /> Ready for Pickup</div>
          <div className="flex items-center gap-1"><Check size={10} className="text-green-600" /> Picked Up</div>
          <div className="flex items-center gap-1"><XCircle size={10} className="text-red-500" /> Rejected</div>
          <div className="flex items-center gap-1"><XCircle size={10} className="text-gray-400" /> Cancelled</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-8 lg:pt-12 border-t border-gray-200">
        <div className="space-y-6">
          <h3 className="text-lg lg:text-xl font-bold text-gray-800">Pickup Information:</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin size={20} className="text-red-500 shrink-0" />
              <span className="font-medium text-sm lg:text-base">Custodian Office – Main Building</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={20} className="text-gray-400 shrink-0" />
              <span className="font-medium text-sm lg:text-base">Monday to Friday</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock size={20} className="text-gray-400 shrink-0" />
              <span className="font-medium text-sm lg:text-base">8:00 AM – 4:00 PM</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-amber-100 flex items-start gap-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <p className="text-amber-900 font-bold text-base lg:text-lg leading-tight">
            Unclaimed items after 7 days of being "Ready for Pickup" may be automatically cancelled.
          </p>
        </div>
      </div>
    </div>
  );
};
