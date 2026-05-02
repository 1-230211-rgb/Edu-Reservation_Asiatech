import React, { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { InventoryItem } from '../types';
import { toast } from 'sonner';

interface AdminInventoryProps {
  inventory: InventoryItem[];
  onUpdate: (item: InventoryItem) => void;
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({ inventory, onUpdate, onAdd }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeGender, setActiveGender] = useState<'All' | 'Female' | 'Male'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'Pre-School',
    gender: 'Female',
    sizes: { S: 0, M: 0, L: 0 }
  });

  const categories = ['All', 'Pre-School', 'Grade School', 'High School'];

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesGender = activeGender === 'All' || item.gender === activeGender || item.gender === 'General';
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesGender && matchesSearch;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aIsAccessory = aName.includes('ribbon') || aName.includes('neck') || aName.includes('lace') || aName.includes('tie');
    const bIsAccessory = bName.includes('ribbon') || bName.includes('neck') || bName.includes('lace') || bName.includes('tie');
    
    // Sort by category first if 'All' is selected
    if (activeCategory === 'All' && a.category !== b.category) {
      const order = ['Pre-School', 'Grade School', 'High School'];
      return order.indexOf(a.category) - order.indexOf(b.category);
    }
    
    // Within category, put accessories at the bottom
    if (aIsAccessory && !bIsAccessory) return 1;
    if (!aIsAccessory && bIsAccessory) return -1;
    return 0;
  });

  const handleAddNew = () => {
    if (!newItem.name) {
      toast.error("Please enter a name for the new item.");
      return;
    }
    
    // Ensure correct size keys for Accessories
    const finalSizes = newItem.category === 'Accessories' 
      ? { Standard: newItem.sizes.Standard || newItem.sizes.S || 0 }
      : { S: newItem.sizes.S || 0, M: newItem.sizes.M || 0, L: newItem.sizes.L || 0 };

    // Automatically determine status based on initial stock
    const totalStock = Object.values(finalSizes).reduce((acc, curr) => acc + (curr || 0), 0);
    const finalStatus = totalStock === 0 ? 'Out of Stock' : 'Available';

    onAdd({
      ...newItem,
      sizes: finalSizes,
      status: finalStatus
    });

    setIsAddingNew(false);
    setNewItem({
      name: '',
      category: 'Pre-School',
      gender: 'Female',
      sizes: { S: 0, M: 0, L: 0 }
    });
    toast.success("New item added to inventory!");
  };

  const handleQuickStockUpdate = (item: InventoryItem, size: string, adjustment: number) => {
    const newSizes = {
      ...item.sizes,
      [size]: Math.max(0, (item.sizes[size] || 0) + adjustment)
    };
    
    const totalStock = Object.values(newSizes).reduce((acc, curr) => acc + (curr || 0), 0);
    const newStatus = totalStock === 0 ? 'Out of Stock' : 'Available';

    onUpdate({
      ...item,
      sizes: newSizes,
      status: newStatus
    });
  };

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Package className="text-gray-400 mt-1 shrink-0" size={24} />
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#385723] tracking-tight">Inventory Management</h1>
            <p className="text-gray-400 text-xs lg:text-sm">Monitor and update uniform stocks.</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAddingNew(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.05]"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#4ade80]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-[#385723] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 border-l border-gray-200 pl-4">
            {(['All', 'Female', 'Male'] as const).map((gender) => (
              <button
                key={gender}
                onClick={() => setActiveGender(gender)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeGender === gender 
                    ? 'bg-[#4ade80] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl lg:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Stock Levels</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedInventory.map((item) => {
                let itemImage = '/logo.jpg'; // Default fallback
                const nameLower = item.name.toLowerCase();
                const category = item.category;

                if (nameLower.includes('blouse')) itemImage = '/ps-blouse.png';
                else if (nameLower.includes('pencil skirt') || (nameLower.includes('skirt') && category === 'High School')) itemImage = '/gs-hs-pencilskirt.png';
                else if (nameLower.includes('skirt')) itemImage = '/ps-skirt.png';
                else if (nameLower.includes('long sleeves')) itemImage = '/gs-hs-longsleeves.png';
                else if (nameLower.includes('polo') && (category === 'Grade School' || category === 'High School')) itemImage = '/gs-hs-polo.png';
                else if (nameLower.includes('polo')) itemImage = '/ps-polo.png';
                else if (nameLower.includes('short')) itemImage = '/ps-short.png';
                else if (nameLower.includes('pe shirt')) itemImage = '/pe-shirts.png';
                else if (nameLower.includes('pe pants')) itemImage = '/pe-pants.png';
                else if (nameLower.includes('pants')) itemImage = '/gs-hs-pants.png';
                else if (nameLower.includes('ribbon') && item.gender === 'Male') itemImage = '/ps-male-ribbon.png';
                else if (nameLower.includes('ribbon')) itemImage = '/ribbon.png';
                else if (nameLower.includes('vest') && item.gender === 'Female') itemImage = '/gs-female-vest.png';
                else if (nameLower.includes('vest') && item.gender === 'Male') itemImage = '/gs-male-vest.png';
                else if (nameLower.includes('neck tie') || nameLower.includes('necktie')) itemImage = '/gs-hs-necktie.png';
                else if (nameLower.includes('lace')) itemImage = '/id-lace.png';

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center p-2 shrink-0 overflow-hidden">
                          <img 
                            src={itemImage} 
                            alt={item.name} 
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{item.gender}</p>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#385723]/10 text-[#385723] rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      {Object.entries(item.sizes).map(([size, stock]) => (
                        <div key={size} className="w-20 bg-gray-50 p-1.5 rounded-xl border border-gray-100 text-center shadow-sm">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mb-1">{size}</p>
                          <div className="flex items-center justify-between gap-1 bg-white/50 rounded-lg p-0.5">
                            <button 
                              onClick={() => handleQuickStockUpdate(item, size, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors shadow-sm cursor-pointer"
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <span className={`text-sm font-black min-w-[2ch] transition-colors ${
                              (stock as number) === 0 ? 'text-red-500' : (stock as number) < 10 ? 'text-amber-500' : 'text-[#385723]'
                            }`}>
                              {stock as number}
                            </span>
                            <button 
                              onClick={() => handleQuickStockUpdate(item, size, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors shadow-sm cursor-pointer"
                              title="Increase stock"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.values(item.sizes).some(s => (s as number) > 0 && (s as number) < 10) && (
                      <div className="flex items-center justify-center gap-1 text-amber-600 mt-2 animate-pulse">
                        <AlertTriangle size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Low Stock Alert</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm border ${
                        item.status === 'Out of Stock' 
                          ? 'bg-red-50 text-red-600 border-red-100' 
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {item.status || 'Available'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer">
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add New Item Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddingNew(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#385723]">Add New Item</h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Name</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#4ade80]"
                  placeholder="e.g. Grade School Polo"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <select 
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#4ade80]"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                <select 
                  value={newItem.gender}
                  onChange={(e) => setNewItem({...newItem, gender: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#4ade80]"
                >
                  <option value="General">General</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {newItem.category === 'Accessories' ? 'Initial Stock (Standard)' : 'Initial Stocks (S/M/L)'}
                </label>
                <div className="flex gap-2">
                  {newItem.category === 'Accessories' ? (
                    <input 
                      type="number"
                      placeholder="Standard"
                      onChange={(e) => setNewItem({
                        ...newItem, 
                        sizes: { Standard: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-center focus:ring-2 focus:ring-[#4ade80]"
                    />
                  ) : (
                    ['S', 'M', 'L'].map(size => (
                      <input 
                        key={size}
                        type="number"
                        placeholder={size}
                        onChange={(e) => setNewItem({
                          ...newItem, 
                          sizes: { ...newItem.sizes, [size]: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-center focus:ring-2 focus:ring-[#4ade80]"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddNew}
                className="flex-1 py-3 bg-[#4ade80] text-white font-bold rounded-xl hover:bg-[#22c55e] transition-colors shadow-lg"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
