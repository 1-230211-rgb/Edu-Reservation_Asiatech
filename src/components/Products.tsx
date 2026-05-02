import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { User, InventoryItem } from '../types';
import { toast } from 'sonner';

type Category = 'Pre-School' | 'Grade School' | 'High School';

interface ProductsProps {
  user?: User | null;
  inventory: InventoryItem[];
  onReserveSuccess?: () => void;
}

export const Products: React.FC<ProductsProps> = ({ user, inventory, onReserveSuccess }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('Pre-School');
  const [selectedGender, setSelectedGender] = useState<'Female' | 'Male'>('Female');
  const [selectedSet, setSelectedSet] = useState<'PE Set' | 'Uniform Set' | null>('PE Set');
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Medium' | 'Large'>('Small');
  const [selectedIndividualItem, setSelectedIndividualItem] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isReserving, setIsReserving] = useState(false);
  const [reservationConfirmation, setReservationConfirmation] = useState<any>(null);

  const categories: Category[] = ['Pre-School', 'Grade School', 'High School'];

  const handleReserve = async () => {
    if (!user) {
      toast.error("Please log in to make a reservation.");
      return;
    }

    if (!selectedIndividualItem) {
      toast.error("Please select an item from the list first.");
      return;
    }

    setIsReserving(true);
    
    const size = selectedItemData?.name.toLowerCase().includes('ribbon') || 
                 selectedItemData?.name.toLowerCase().includes('neck') || 
                 selectedItemData?.name.toLowerCase().includes('lace') ? 'Standard' : selectedSize;
    
    try {
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category: activeCategory,
          gender: selectedGender,
          individualItem: selectedIndividualItem,
          set: selectedSet,
          size,
          quantity,
          studentGrade: user?.grade || 'N/A'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const details = {
          id: data.reservationId,
          category: activeCategory,
          gender: selectedGender,
          item: selectedIndividualItem || selectedSet,
          image: selectedItemData?.image,
          size,
          quantity,
          date: new Date().toLocaleDateString()
        };
        setReservationConfirmation(details);
        setSelectedIndividualItem('');
        if (onReserveSuccess) onReserveSuccess();
        toast.success("Reservation request sent successfully!");
      } else {
        toast.error(data.message || "Failed to create reservation");
      }
    } catch (error) {
      console.error("Reservation error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsReserving(false);
    }
  };

  const formatItemName = (name: string) => {
    if (name.includes('M/F')) {
      return name.replace(' M/F', '');
    }
    return name;
  };

  const getStocksForCategory = (category: Category) => {
    const categoryItems = inventory.filter(item => {
      return item.category === category && (item.gender === selectedGender || item.gender === 'General');
    });
    
    const processedItems = categoryItems.map(item => {
      let itemImage = '/logo.jpg';
      const nameLower = item.name.toLowerCase();

      // PS specific or defaults
      if (nameLower.includes('blouse')) itemImage = '/ps-blouse.png';
      else if (nameLower.includes('pencil skirt') || (nameLower.includes('skirt') && (category === 'High School' || item.category === 'High School'))) itemImage = '/gs-hs-pencilskirt.png';
      else if (nameLower.includes('skirt')) itemImage = '/ps-skirt.png';
      else if (nameLower.includes('long sleeves')) itemImage = '/gs-hs-longsleeves.png';
      else if (nameLower.includes('polo') && (category === 'Grade School' || category === 'High School' || item.category === 'Grade School' || item.category === 'High School')) itemImage = '/gs-hs-polo.png';
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

      return {
        name: item.name.replace(`${category} `, '') + (item.gender !== 'General' ? ` (${item.gender})` : ''),
        fullName: item.name,
        gender: item.gender,
        stocks: item.sizes as Record<string, number>,
        status: item.status || 'Available',
        image: itemImage
      };
    });

    // Sort: Accessories at the bottom
    return [...processedItems].sort((a, b) => {
      const aName = a.fullName.toLowerCase();
      const bName = b.fullName.toLowerCase();
      const aIsAccessory = aName.includes('ribbon') || aName.includes('neck') || aName.includes('lace') || aName.includes('tie');
      const bIsAccessory = bName.includes('ribbon') || bName.includes('neck') || bName.includes('lace') || bName.includes('tie');
      
      if (aIsAccessory && !bIsAccessory) return 1;
      if (!aIsAccessory && bIsAccessory) return -1;
      return 0;
    });
  };

  const categoryInfo = {
    'Pre-School': {
      title: 'Basic Education Department',
      description: 'Explore our collection of high-quality school uniforms and accessories designed for Pre-School students — promoting comfort, confidence, and school pride.',
      items: getStocksForCategory('Pre-School')
    },
    'Grade School': {
      title: 'Basic Education Department',
      description: 'Explore our collection of high-quality school uniforms and accessories designed for Grade School students (Grade 1-6) — promoting comfort, confidence, and school pride.',
      items: getStocksForCategory('Grade School')
    },
    'High School': {
      title: 'Basic Education Department',
      description: 'Explore our collection of high-quality school uniforms and accessories designed for High School students (JHS/SHS) — promoting comfort, confidence, and school pride.',
      items: getStocksForCategory('High School')
    }
  };

  const currentItems = categoryInfo[activeCategory].items;
  const selectedItemData = currentItems.find(i => i.fullName === selectedIndividualItem);

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl lg:text-5xl font-serif text-[#2d4a1e] font-bold tracking-tight">
          Basic Education Department
        </h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed text-sm lg:text-base">
          {categoryInfo[activeCategory].description}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedIndividualItem('');
            }}
            className={`flex-1 p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-left transition-all transform hover:scale-[1.02] ${
              activeCategory === cat
                ? 'bg-[#4ade80] text-white shadow-xl'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <h3 className="text-xl lg:text-2xl font-bold mb-1">{cat}</h3>
            <p className={`text-[10px] font-semibold uppercase tracking-widest ${activeCategory === cat ? 'text-white/80' : 'text-gray-400'}`}>
              {cat === 'Pre-School' ? '' : cat === 'Grade School' ? '(Grade 1-6)' : '(JHS/SHS)'}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {/* Product Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#385723] uppercase tracking-widest">Available Items</h2>
            <div className="flex gap-4">
              {(['Female', 'Male'] as const).map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                  <div 
                    onClick={() => {
                      setSelectedGender(g);
                      setSelectedIndividualItem(''); // Reset selection when gender changes to avoid mismatch
                    }}
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                      selectedGender === g ? 'bg-[#385723] border-[#385723]' : 'border-gray-300 group-hover:border-[#385723]'
                    }`}
                  >
                    {selectedGender === g && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((item) => (
              <motion.div
                key={item.fullName}
                layoutId={item.fullName}
                onClick={() => {
                  setSelectedIndividualItem(item.fullName);
                  setSelectedSet(null);
                }}
                className={`group cursor-pointer bg-white rounded-3xl p-6 lg:p-8 border-2 transition-all ${
                  selectedIndividualItem === item.fullName
                    ? 'border-[#4ade80] shadow-2xl ring-4 ring-[#4ade80]/10'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-xl'
                }`}
              >
                <div className="aspect-square bg-gray-50 rounded-[2rem] mb-6 overflow-hidden relative flex items-center justify-center p-6">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ${item.status === 'Out of Stock' ? 'grayscale opacity-50' : ''}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.jpg';
                    }}
                  />
                  {item.status === 'Out of Stock' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {selectedIndividualItem === item.fullName && item.status !== 'Out of Stock' && (
                    <div className="absolute top-4 right-4 bg-[#4ade80] text-white p-2 rounded-full shadow-lg">
                      <Check size={20} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm lg:text-base font-bold text-gray-800 line-clamp-2 uppercase tracking-tight leading-tight">
                    {formatItemName(item.name)}
                  </h3>
                  <div className="flex items-center justify-between">
                    {item.status !== 'Out of Stock' && (
                      <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {Object.values(item.stocks).reduce((a: number, b: number) => a + b, 0)} in stock
                      </p>
                    )}
                    <span className="text-[10px] font-black text-[#385723] bg-[#385723]/5 px-2 py-1 rounded-md">
                      {item.gender}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Selection Modal - Only visible when an item is selected */}
        <AnimatePresence>
          {selectedIndividualItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedIndividualItem('')}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[2rem] lg:rounded-[3rem] p-8 lg:p-10 shadow-2xl border border-gray-100 space-y-6 lg:space-y-8"
              >
                {selectedItemData && (
                  <div className="aspect-video bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center p-6 mb-2">
                    <img 
                      src={selectedItemData.image} 
                      alt={selectedItemData.name} 
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpg';
                      }}
                    />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-2xl lg:text-3xl font-bold text-[#385723] tracking-tight">
                      {selectedItemData ? formatItemName(selectedItemData.name) : selectedIndividualItem}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                      {activeCategory} • {selectedGender}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedIndividualItem('')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6 lg:space-y-8">
                  {/* Size Selection */}
                  {!(selectedItemData?.name.toLowerCase().includes('ribbon') || 
                     selectedItemData?.name.toLowerCase().includes('neck') || 
                     selectedItemData?.name.toLowerCase().includes('lace')) ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Select Size:
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {(['Small', 'Medium', 'Large'] as const).map((sz) => (
                          <label key={sz} className="flex items-center gap-3 cursor-pointer group">
                            <div 
                              onClick={() => setSelectedSize(sz)}
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                                selectedSize === sz ? 'bg-[#385723] border-[#385723]' : 'border-gray-300 group-hover:border-[#385723]'
                              }`}
                            >
                              {selectedSize === sz && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{sz}</span>
                              {selectedItemData && selectedItemData.status !== 'Out of Stock' && (
                                <span className={`text-[8px] font-bold ${selectedItemData.stocks[sz.charAt(0)] < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                                  {selectedItemData.stocks[sz.charAt(0)]} left
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Size not applicable
                      </p>
                      <div className="px-4 py-2 bg-[#385723]/5 rounded-lg border border-[#385723]/20">
                        <span className="text-xs font-bold text-[#385723] uppercase tracking-widest">Standard Size Only</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700 uppercase tracking-widest">Quantity:</span>
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl font-bold text-gray-500 hover:text-gray-700">-</button>
                      <span className="font-bold w-4 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="text-xl font-bold text-gray-500 hover:text-gray-700">+</button>
                    </div>
                  </div>

                  <button 
                    onClick={handleReserve}
                    disabled={isReserving || selectedItemData?.status === 'Out of Stock'}
                    className="w-full py-4 lg:py-5 bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg lg:text-xl rounded-xl lg:rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isReserving ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Processing...
                      </>
                    ) : selectedItemData?.status === 'Out of Stock' ? (
                      'Out of Stock'
                    ) : (
                      'Reserve Now'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Reservation Confirmation Modal */}
      <AnimatePresence>
        {reservationConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setReservationConfirmation(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl p-8 lg:p-10"
            >
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} />
                </div>
                <h2 className="text-2xl font-bold text-[#385723]">Reservation Success!</h2>
                <p className="text-gray-500 text-sm">Your reservation has been recorded. Please wait for approval.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  {reservationConfirmation.image && (
                    <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-gray-100">
                      <img 
                        src={reservationConfirmation.image} 
                        alt={reservationConfirmation.item} 
                        className="w-full h-full object-contain mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-400 font-medium">Reservation ID</span>
                      <span className="font-bold text-gray-800">{reservationConfirmation.id}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-400 font-medium">Item</span>
                      <span className="font-bold text-gray-800">{reservationConfirmation.item}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-400 font-medium">Gender</span>
                      <span className="font-bold text-gray-800">{reservationConfirmation.gender}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-400 font-medium">Size</span>
                      <span className="font-bold text-gray-800">{reservationConfirmation.size}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-400 font-medium">Quantity</span>
                      <span className="font-bold text-gray-800">{reservationConfirmation.quantity}</span>
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-gray-400 font-medium">Date</span>
                      <span className="font-bold text-gray-800">{reservationConfirmation.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => setReservationConfirmation(null)}
                      className="flex-1 py-4 bg-[#385723] text-white font-bold rounded-xl hover:bg-[#2d4a1e] transition-colors shadow-lg"
                    >
                      Done
                    </button>
                    <button 
                      onClick={() => {
                        toast.info("Reservation cancelled successfully.");
                        setReservationConfirmation(null);
                      }}
                      className="px-6 py-4 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
