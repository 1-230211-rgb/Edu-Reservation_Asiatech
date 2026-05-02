import { Info, ShieldCheck, FileText, AlertCircle, UserCheck, Settings, Users, ClipboardCheck, History, Database } from 'lucide-react';
import { UserRole } from '../types';

interface PoliciesProps {
  userRole?: UserRole;
}

export const Policies: React.FC<PoliciesProps> = ({ userRole }) => {
  const studentPolicies = [
    {
      id: 1,
      title: 'Reservation Policy',
      icon: <FileText size={24} className="text-blue-500" />,
      items: [
        'EduReserve is for reservation only (no online payment).',
        'One account per verified student.',
        'Reservations are on a first-come, first-served basis.'
      ]
    },
    {
      id: 2,
      title: 'Approval and Claiming',
      icon: <UserCheck size={24} className="text-green-500" />,
      items: [
        'Wait for admin approval before claiming.',
        'Claim approved items within 7 days, or they\'ll be cancelled.'
      ]
    },
    {
      id: 3,
      title: 'Cancellation',
      icon: <AlertCircle size={24} className="text-red-500" />,
      items: [
        'You can cancel only if your reservation is still Pending.',
        'Approved reservations can\'t be cancelled online.'
      ]
    },
    {
      id: 4,
      title: 'Data Privacy',
      icon: <ShieldCheck size={24} className="text-indigo-500" />,
      items: [
        'All user information is confidential and used only for reservation.',
        'Keep your login credentials private.'
      ]
    },
    {
      id: 5,
      title: 'System Use',
      icon: <Settings size={24} className="text-gray-500" />,
      items: [
        'Do not misuse or alter the system.',
        'Report technical issues to the Custodian Office or system admin.'
      ]
    }
  ];

  const adminPolicies = [
    {
      id: 1,
      title: 'Operational Standards',
      icon: <History size={24} className="text-blue-600" />,
      items: [
        'Review and process pending reservations at least twice daily.',
        'Handle approval requests within a 24-48 hour window.',
        'Ensure all status updates are correctly logged in the system.'
      ]
    },
    {
      id: 2,
      title: 'Inventory Integrity',
      icon: <Database size={24} className="text-amber-600" />,
      items: [
        'System automatically updates inventory stock levels whenever a student reserves or cancels an item.',
        'Admin manually adjusts stock only when new items are added back into inventory.',
        'Flag items as "Out of Stock" if availability drops below minimum threshold.'
      ]
    },
    {
      id: 3,
      title: 'Student Accountability',
      icon: <Users size={24} className="text-indigo-600" />,
      items: [
        'Strictly verify student ID/credentials before approving registrations.',
        'Monitor for suspicious activity or duplicate account creations.',
        'Deactivate accounts found violating school policies.'
      ]
    },
    {
      id: 4,
      title: 'Communication Protocol',
      icon: <ClipboardCheck size={24} className="text-emerald-600" />,
      items: [
        'Notify students promptly if a reserved item is actually unavailable.',
        'Provide clear reasons in the system when rejecting a reservation.'
      ]
    },
    {
      id: 5,
      title: 'Data & Access Security',
      icon: <ShieldCheck size={24} className="text-red-600" />,
      items: [
        'Never share administrative login credentials with unauthorized personnel.',
        'Ensure the system dashboard is locked when leaving the workstation.',
        'Report any potential data breaches or system glitches immediately.'
      ]
    }
  ];

  const policies = userRole === 'admin' ? adminPolicies : studentPolicies;

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12">
      <div className="relative h-48 lg:h-64 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border-2 lg:border-4 border-white">
        <img 
          src="/banner.jpg" 
          alt="Policy Banner" 
          className="w-full h-full object-cover brightness-75"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/policy-banner/1200/400';
          }}
        />
      </div>

      <div className="flex items-center gap-4 mb-8 lg:mb-12">
        <ShieldCheck className="text-[#385723] shrink-0" size={32} />
        <h2 className="text-2xl lg:text-4xl font-bold text-[#385723] tracking-tight">
          {userRole === 'admin' ? "Admin Policies & Guidelines" : "Student Policies/Guidelines"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white p-6 lg:p-10 rounded-2xl lg:rounded-[2rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow group">
            <div className="flex items-center gap-4 mb-4 lg:mb-6">
              <div className="p-2 lg:p-3 bg-gray-50 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform">
                {policy.icon}
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">{policy.id}. {policy.title}</h3>
            </div>
            <ul className="space-y-2 lg:space-y-3 text-gray-600 font-medium list-disc pl-6 leading-relaxed text-sm lg:text-base">
              {policy.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
