import { useState, useEffect } from "react";
import { Search, ShoppingBag, Heart, Trash2, ShieldAlert, Plus, Minus, Check, Clipboard, AlertCircle, Eye, Star, Sprout, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Medicine, User } from "../types";

interface MedicineStoreViewProps {
  medicines: Medicine[];
  user: User | null;
  token: string | null;
  onPlaceOrder: (orderData: any) => Promise<boolean>;
  onNavigateToTab?: (tab: string) => void;
  initialSearchTerm?: string;
}

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
}

// Map of premium natural ingredients, benefits, ratings, and tags for realistic Ayurvedic context
const medicineHerbDetails: Record<string, { ingredients: string; benefits: string; rating: number; tags: string[] }> = {
  "med-1": {
    ingredients: "Purified antipyretic compounds",
    benefits: "Alleviates seasonal body fever, relieves head tension & general fatigue",
    rating: 4.6,
    tags: ["Fever Care", "Rapid Pain Relief", "Over-The-Counter"]
  },
  "med-2": {
    ingredients: "HMG-CoA reductase inhibitor active crystals",
    benefits: "Balances arterial lipid density, guards cardiovascular cells & blood flow",
    rating: 4.8,
    tags: ["Heart Care", "Vascular Health", "Arterial Purifier"]
  },
  "med-3": {
    ingredients: "Sustained-release biguanide compounds",
    benefits: "Sustains flat blood glucose levels, improves insulin absorption of liver cells",
    rating: 4.7,
    tags: ["Blood Glucose Balance", "Type-2 Diabetes", "Metabolic Harmony"]
  },
  "med-4": {
    ingredients: "100% Organic Ashwagandha (Withania Somnifera) Root Powder",
    benefits: "Soothes stressed central nervous system, reduces cortisol, elevates vitality & balances Vata dosha",
    rating: 4.9,
    tags: ["Stress Alleviator", "Dosha Rebalancing", "Rasayana Rejuvenator", "Adrenal Support"]
  },
  "med-5": {
    ingredients: "Panax Ginseng Root, Ginkgo Biloba leaves extract, Green Tea flavonoids & Zinc",
    benefits: "Protects brain memory cells, removes cellular oxidants & supplies whole-day stamina",
    rating: 4.8,
    tags: ["Whole Body Stamina", "Oxidant Flush", "Anti-Fatigue", "Immunity Guard"]
  }
};

export default function MedicineStoreView({
  medicines,
  user,
  token,
  onPlaceOrder,
  onNavigateToTab,
  initialSearchTerm = ""
}: MedicineStoreViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeSection, setActiveSection] = useState<"store" | "cart" | "checkout" | "ordered">("store");

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Selected product for "Quick View" modal
  const [quickViewProduct, setQuickViewProduct] = useState<Medicine | null>(null);

  // Checkout address & coupon details
  const [coupon, setCoupon] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [address, setAddress] = useState(user?.address || "Flat 402, Green Meadows, Noida");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [orderInvoiceId, setOrderInvoiceId] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const categories = [
    "All",
    "Ayurveda",
    "OTC Medicines",
    "Prescription Medicines",
    "Vitamins & Supplements",
    "Heart Care",
    "Diabetes"
  ];

  // Helper function for intelligent search highlighting
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-green-100 text-[#2E7D32] font-bold px-1.5 py-0.5 rounded-md dark:bg-green-900/50 dark:text-green-200"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Check if medicine matches search query in Name, Brand, Description, Category, Ingredients, Benefits, Tags
  const matchesSearch = (med: Medicine, term: string) => {
    if (!term.trim()) return true;
    const q = term.toLowerCase();
    const details = medicineHerbDetails[med.id] || { ingredients: "", benefits: "", tags: [] };

    return (
      med.name.toLowerCase().includes(q) ||
      med.brand.toLowerCase().includes(q) ||
      med.description.toLowerCase().includes(q) ||
      med.category.toLowerCase().includes(q) ||
      details.ingredients.toLowerCase().includes(q) ||
      details.benefits.toLowerCase().includes(q) ||
      details.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  };

  const filteredMeds = medicines.filter((med) => {
    const matchesCategory = activeCategory === "All" || med.category === activeCategory;
    const matchesSearchText = matchesSearch(med, searchTerm);
    return matchesCategory && matchesSearchText;
  });

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToCart = (med: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === med.id);
      if (existing) {
        return prev.map((item) =>
          item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: med.id,
          name: med.name,
          brand: med.brand,
          price: med.price,
          discount: med.discount,
          quantity: 1,
          image: med.image
        }
      ];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const getPriceAfterDiscount = (price: number, discount: number) => {
    return Math.round(price * (1 - discount / 100));
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    const actPrice = getPriceAfterDiscount(item.price, item.discount);
    return acc + actPrice * item.quantity;
  }, 0);

  const deliveryCharge = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 40;
  const gst = Math.round(cartSubtotal * 0.12);
  const grandTotal = Math.max(0, cartSubtotal + deliveryCharge + gst - discountAmount);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "MED10") {
      const disc = Math.round(cartSubtotal * 0.1);
      setDiscountAmount(disc);
    } else {
      alert("Invalid Coupon Code. Try 'MED10' for 10% off!");
    }
  };

  const handlePlaceOrderSubmit = async () => {
    if (!token) {
      alert("Sign in required. Please enter your name and mobile number first.");
      onNavigateToTab?.("login");
      return;
    }
    if (!address) {
      alert("Please provide a delivery address.");
      return;
    }

    setIsOrdering(true);
    const success = await onPlaceOrder({
      items: cart,
      address,
      paymentMethod,
      couponCode: coupon || "None",
      deliveryCharges: deliveryCharge,
      gst,
      grandTotal
    });

    if (success) {
      setOrderInvoiceId(`inv-${Date.now().toString().slice(-6)}`);
      setCart([]);
      setDiscountAmount(0);
      setCoupon("");
      setActiveSection("ordered");
    } else {
      alert("An issue occurred placing your order. Try again.");
    }
    setIsOrdering(false);
  };

  return (
    <div className="space-y-8">
      {/* Navigation Headers for Store Sections */}
      <div className="flex border-b border-green-100/30 dark:border-slate-700/60 pb-3 justify-between items-center bg-[#FCFBF7]/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-16 z-30 pt-2">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveSection("store")}
            className={`text-sm font-bold pb-2 transition border-b-2 ${
              activeSection === "store" ? "border-[#2E7D32] text-[#2E7D32]" : "border-transparent text-slate-500"
            }`}
          >
            Apothecary Catalog
          </button>
          <button
            onClick={() => {
              if (cart.length === 0) alert("Your pharmacy cart is empty!");
              else setActiveSection("cart");
            }}
            className={`text-sm font-bold pb-2 transition border-b-2 relative ${
              activeSection === "cart" ? "border-[#2E7D32] text-[#2E7D32]" : "border-transparent text-slate-500"
            }`}
          >
            My Herb Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-3.5 bg-green-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full shadow-sm">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {wishlist.length > 0 && (
          <span className="text-xs text-[#2E7D32] font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100/40">
            🌿 {wishlist.length} Saved in Wellness Box
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Medicine Catalog Section */}
        {activeSection === "store" && (
          <motion.div
            key="store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* STICKY SEARCH & CATEGORY BAR */}
            <div className="sticky top-[215px] md:top-[210px] z-20 bg-[#FCFBF7]/90 dark:bg-slate-900/90 backdrop-blur-md py-4 border-y border-green-50/60 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search botanical remedies, herbs, ingredients (e.g. Ashwagandha)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#2E7D32] focus:outline-none shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin scrollbar-thumb-sage">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                        activeCategory === cat
                          ? "bg-[#2E7D32] text-white shadow-md shadow-green-100 dark:shadow-none"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            {filteredMeds.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMeds.map((med) => {
                  const info = medicineHerbDetails[med.id] || { ingredients: "Premium Blend", benefits: "Restorative wellness", rating: 4.8, tags: [] };
                  return (
                    <motion.div
                      key={med.id}
                      whileHover={{ y: -6 }}
                      className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-xl border border-green-50/40 dark:border-slate-700 flex flex-col justify-between h-full space-y-4"
                    >
                      <div className="relative h-44 bg-[#FCFBF7] dark:bg-slate-900 rounded-2xl overflow-hidden shrink-0 group">
                        <img src={med.image} alt={med.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <button
                          onClick={() => toggleWishlist(med.id)}
                          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md text-[#2E7D32] transition duration-200 hover:scale-110"
                        >
                          <Heart size={14} className={wishlist.includes(med.id) ? "fill-current text-[#2E7D32]" : ""} />
                        </button>

                        <button
                          onClick={() => setQuickViewProduct(med)}
                          className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md text-slate-600 transition duration-200 hover:scale-110 flex items-center justify-center"
                          title="Quick View"
                        >
                          <Eye size={14} />
                        </button>

                        {med.prescriptionRequired ? (
                          <span className="absolute bottom-3 left-3 bg-red-500/90 text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                            <ShieldAlert size={10} /> Rx Required
                          </span>
                        ) : (
                          <span className="absolute bottom-3 left-3 bg-green-700/90 text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                            <Sprout size={10} /> 100% Organic
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{highlightText(med.brand, searchTerm)}</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                            <Star size={10} className="fill-current" /> {info.rating}
                          </span>
                        </div>
                        <h5 className="font-serif font-bold text-slate-800 dark:text-white line-clamp-1">{highlightText(med.name, searchTerm)}</h5>
                        
                        {/* Dynamic ingredients & benefits snippet */}
                        <div className="space-y-1 bg-[#FCFBF7] dark:bg-slate-900 p-2.5 rounded-xl border border-green-50/30">
                          <p className="text-[10px] text-[#2E7D32] font-semibold flex items-center gap-1">
                            <Sprout size={10} /> {highlightText(info.ingredients, searchTerm)}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                            {highlightText(info.benefits, searchTerm)}
                          </p>
                        </div>

                        {/* Stock alert */}
                        <div className="text-[9px] font-bold text-slate-400">
                          STOCK STATUS: <span className={med.stock > 20 ? "text-green-600" : "text-amber-500"}>
                            {med.stock > 0 ? `In Stock (${med.stock} bottles left)` : "Out of Stock"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between shrink-0">
                        <div>
                          <div className="text-sm font-extrabold text-slate-800 dark:text-white font-serif">
                            ₹ {getPriceAfterDiscount(med.price, med.discount)}
                          </div>
                          {med.discount > 0 && (
                            <div className="text-[10px] text-slate-400 line-through">₹ {med.price}</div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            addToCart(med);
                            alert(`${med.name} successfully packed in cart!`);
                          }}
                          className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3.5 py-2 rounded-xl text-[10px] font-bold transition flex items-center gap-1 active:scale-95 duration-100"
                        >
                          Pack in Cart
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-green-100/30 shadow-inner max-w-xl mx-auto space-y-4"
              >
                <div className="w-16 h-16 bg-amber-50 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto text-xl">
                  🍃
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-slate-800 dark:text-white">No Botanical Remedies Found</h4>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                    No organic medicine or product matches "<span className="font-bold text-[#2E7D32]">{searchTerm}</span>" in our natural catalog.
                  </p>
                </div>
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs px-4 py-2 rounded-xl font-semibold"
                >
                  Reset Catalog Filters
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Shopping Cart Section */}
        {activeSection === "cart" && (
          <motion.div
            key="cart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h4 className="text-lg font-serif font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#2E7D32]" /> Your Botanical Apothecary Cart
            </h4>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-green-100/10 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white">{item.name}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.brand}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Qty selectors */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-lg p-1">
                      <button onClick={() => updateCartQty(item.id, -1)} className="p-1 text-slate-500 hover:text-slate-800">
                        <Minus size={12} />
                      </button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="p-1 text-slate-500 hover:text-slate-800">
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right font-bold text-slate-800 dark:text-white w-16">
                      ₹ {getPriceAfterDiscount(item.price, item.discount) * item.quantity}
                    </div>

                    <button
                      onClick={() => updateCartQty(item.id, -item.quantity)}
                      className="text-red-400 hover:text-red-600 transition p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations widget */}
            <div className="bg-[#FCFBF7] dark:bg-slate-900 p-6 rounded-3xl border border-green-100/30 text-xs space-y-4">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Botanical Checkout Summary</span>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span> <span className="font-bold">₹ {cartSubtotal}</span></div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sterile Delivery Charge</span>
                  <span className="font-bold">{deliveryCharge === 0 ? "Free Shipping" : `₹ ${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Herbal Duties (CGST/SGST 12%)</span> <span className="font-bold">₹ {gst}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Coupon Applied</span> <span>- ₹ {discountAmount}</span></div>
                )}
                <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 flex justify-between font-bold text-sm text-slate-800 dark:text-white font-serif">
                  <span>Grand Total</span>
                  <span className="text-[#2E7D32]">₹ {grandTotal}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (E.g. MED10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl focus:outline-none text-xs"
                />
                <button onClick={applyCoupon} className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2 rounded-xl font-bold">Apply</button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveSection("store")}
                  className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold transition"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => setActiveSection("checkout")}
                  className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-bold transition shadow-lg active:scale-95 duration-100"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkout Billing Address section */}
        {activeSection === "checkout" && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto space-y-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-green-100/20 dark:border-slate-700"
          >
            <h4 className="text-base font-serif font-bold text-slate-800 dark:text-white mb-2">Delivery Address & Payment</h4>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Enter Shipping Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-[#FCFBF7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Apothecary Payment Option</label>
                <button
                  onClick={() => setPaymentMethod("UPI")}
                  className={`w-full p-3 rounded-xl border text-left font-medium flex justify-between items-center ${
                    paymentMethod === "UPI" ? "border-[#2E7D32] text-[#2E7D32] bg-green-50/5" : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <span>UPI Wallet Payment</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("COD")}
                  className={`w-full p-3 rounded-xl border text-left font-medium flex justify-between items-center ${
                    paymentMethod === "COD" ? "border-[#2E7D32] text-[#2E7D32] bg-green-50/5" : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <span>Cash on Delivery (COD)</span>
                </button>
              </div>

              <div className="bg-[#FCFBF7] dark:bg-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 font-serif">
                  <span>Grand Total:</span>
                  <span className="text-[#2E7D32]">₹ {grandTotal}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setActiveSection("cart")}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200 py-3 rounded-xl font-bold"
                >
                  Edit Cart
                </button>
                <button
                  onClick={handlePlaceOrderSubmit}
                  disabled={isOrdering}
                  className="flex-[2] bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-bold transition shadow-lg active:scale-95 duration-100"
                >
                  {isOrdering ? "Securing Dispatch..." : "Confirm Purchase & Buy"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirmation Ordered section */}
        {activeSection === "ordered" && (
          <motion.div
            key="ordered"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto text-center py-8 space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/20 text-[#2E7D32] flex items-center justify-center mx-auto text-3xl font-bold animate-bounce">
              <Check size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Pharmacy Dispatch Secured!</span>
              <h4 className="text-xl font-serif font-bold text-slate-800 dark:text-white">Order Packaged Successfully</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                Invoice reference: <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">#{orderInvoiceId}</span>. Your therapeutic order is prepared under sterile Ayurvedic regulations. View tracking inside your patient dashboard.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveSection("store")}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold text-xs"
              >
                Back to Pharmacy
              </button>
              <button
                onClick={() => onNavigateToTab?.("dashboard")}
                className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-bold text-xs shadow-md"
              >
                Track Orders
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK VIEW PRODUCT MODAL */}
      <AnimatePresence>
        {quickViewProduct && (() => {
          const info = medicineHerbDetails[quickViewProduct.id] || { ingredients: "Organic components", benefits: "Restorative healing", rating: 4.8, tags: [] };
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setQuickViewProduct(null)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full relative z-10 border border-green-50/50 p-6 space-y-6 text-xs text-slate-700 dark:text-slate-200"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#2E7D32] tracking-widest">{quickViewProduct.category}</span>
                    <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-tight">{quickViewProduct.name}</h4>
                  </div>
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="h-44 bg-[#FCFBF7] dark:bg-slate-900 rounded-2xl overflow-hidden border border-green-50/30">
                    <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={14} className="fill-current" /> {info.rating} Rating
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">PRESCRIBING BRAND:</span>
                      <p className="font-bold text-slate-800 dark:text-white">{quickViewProduct.brand}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">PRICE VALUE:</span>
                      <p className="text-lg font-serif font-bold text-[#2E7D32]">
                        ₹ {getPriceAfterDiscount(quickViewProduct.price, quickViewProduct.discount)}
                        {quickViewProduct.discount > 0 && (
                          <span className="text-xs text-slate-400 line-through ml-2 font-sans font-normal">₹ {quickViewProduct.price}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Sprout size={12} className="text-[#2E7D32]" /> HERBAL INGREDIENTS:</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{info.ingredients}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Sparkles size={12} className="text-[#D4AF37]" /> CLINICAL BENEFITS:</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{info.benefits}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {info.tags.map((t) => (
                      <span key={t} className="text-[9px] bg-green-50 dark:bg-green-950/20 text-[#2E7D32] px-2.5 py-0.5 rounded-full border border-green-100/40">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold"
                  >
                    Close View
                  </button>
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                      alert(`${quickViewProduct.name} successfully packed in cart!`);
                    }}
                    className="flex-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-bold shadow-md active:scale-95 duration-100"
                  >
                    Pack in Cart
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
