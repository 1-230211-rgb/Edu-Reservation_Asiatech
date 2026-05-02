import React, { useState } from 'react';
import { Search, Plus, Minus, MessageCircle } from 'lucide-react';

export const FAQs: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { q: 'What is EduReserve?', a: 'EduReserve is an online school uniform reservation system.' },
    { q: 'Do I need to pay online?', a: "It's up to you. However, payment must be settled within 7 days or before pickup, as you will need to present proof of payment when claiming your items." },
    { q: 'How will I know if my reservation is approved?', a: 'You will receive a notification in the system and your reservation status will update to "Approved".' },
    { q: 'Where and when can I claim my reserved uniform?', a: 'You can claim it at the Custodian Office during the specified pickup window.' },
    { q: 'Can I cancel my reservation?', a: 'Yes, as long as the status is still "Pending".' },
    { q: 'Who should I contact for help?', a: 'You can contact the Custodian Office.' },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12">
      <div className="relative h-48 lg:h-64 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border-2 lg:border-4 border-white">
        <img 
          src="/banner.jpg" 
          alt="FAQ Banner" 
          className="w-full h-full object-cover brightness-75"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/faq-banner/1200/400';
          }}
        />
      </div>

      <div className="text-center space-y-6 lg:space-y-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#385723] tracking-tight">Frequently Asked Questions</h2>
        
        <div className="relative max-w-2xl mx-auto">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 lg:px-8 py-3 lg:py-4 bg-gray-100 border-none rounded-full text-base lg:text-lg focus:ring-2 focus:ring-[#4ade80] transition-all"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-400 uppercase tracking-widest">Category</h3>
          <button className="w-full text-left px-6 py-3 bg-[#4ade80]/10 text-[#385723] font-bold rounded-xl border-l-4 border-[#4ade80]">
            Reservation Guide
          </button>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-end mb-2 lg:mb-4">
            <button 
              onClick={() => setExpandedIndex(expandedIndex === null ? 0 : null)}
              className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600"
            >
              {expandedIndex === null ? 'Expand All' : 'Collapse All'}
            </button>
          </div>
          
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button 
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 lg:px-8 py-4 lg:py-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-base lg:text-lg font-bold text-gray-700">{faq.q}</span>
                {expandedIndex === idx ? <Minus size={20} className="text-gray-400" /> : <Plus size={20} className="text-gray-400" />}
              </button>
              {expandedIndex === idx && (
                <div className="px-6 lg:px-8 py-4 lg:py-6 bg-gray-50 border-t border-gray-100 text-gray-600 leading-relaxed text-sm lg:text-base">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-gray-400 italic">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
