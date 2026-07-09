import { useState, useEffect } from "react";
import {
  Stethoscope,
  Pill,
  Calendar,
  Activity,
  User,
  ShoppingBag,
  Heart,
  Phone,
  MapPin,
  Mail,
  Sparkles,
  ArrowRight,
  Clock,
  LayoutDashboard,
  Award,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  Lock,
  Plus,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, Medicine, Appointment, Order, Blog } from "./types";
import HealthTools from "./components/HealthTools";
import AiAssistant from "./components/AiAssistant";
import MedicalBlog from "./components/MedicalBlog";
import DoctorsView from "./components/DoctorsView";
import BookAppointmentFlow from "./components/BookAppointmentFlow";
import MedicineStoreView from "./components/MedicineStoreView";
import DashboardsView from "./components/DashboardsView";
import HomeSections from "./components/HomeSections";

function FloatingLeaves() {
  const leaves = [
    { left: "5%", delay: 0, size: 24, duration: 25 },
    { left: "20%", delay: 4, size: 18, duration: 28 },
    { left: "40%", delay: 8, size: 30, duration: 32 },
    { left: "65%", delay: 2, size: 16, duration: 26 },
    { left: "85%", delay: 11, size: 22, duration: 30 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          initial={{ y: -100, opacity: 0, rotate: 0 }}
          animate={{
            y: ["0%", "100vh"],
            opacity: [0, 0.4, 0.4, 0],
            rotate: [0, 360],
            x: [0, 30, -30, 0]
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: "linear"
          }}
          style={{
            position: "fixed",
            left: leaf.left,
            fontSize: `${leaf.size}px`,
            color: "#A5D6A7",
            top: 0
          }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    const iframe = document.getElementById("hero-video-iframe") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: nextMuted ? "mute" : "unMute"
        }),
        "*"
      );
    }
  };

  // Core authorization and records state
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Loaded database arrays
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Auth Forms states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authRole, setAuthRole] = useState<"patient" | "doctor">("patient");
  const [authSpecialization, setAuthSpecialization] = useState("General Medicine");
  const [authLicense, setAuthLicense] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Pre-selected parameters for booking page deep links
  const [preSelectedDocId, setPreSelectedDocId] = useState<string | null>(null);
  const [preSelectedDept, setPreSelectedDept] = useState<string | null>(null);

  // Load theme preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Load doctors and medicines initially
  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data.doctors) setDoctors(data.doctors);
      });

    fetch("/api/medicines")
      .then((res) => res.json())
      .then((data) => {
        if (data.medicines) setMedicines(data.medicines);
      });
  }, []);

  // Sync session and active records on token updates
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUserData();
      fetchUserRecords();
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setAppointments([]);
      setOrders([]);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        // Token expired
        setToken(null);
      }
    } catch (e) {
      setToken(null);
    }
  };

  const fetchUserRecords = async () => {
    try {
      const aptRes = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const aptData = await aptRes.json();
      if (aptData.appointments) {
        setAppointments(aptData.appointments);
      }

      const orderRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = await orderRes.json();
      if (orderData.orders) {
        setOrders(orderData.orders);
      }
    } catch (e) {
      console.error("Error pooling user files records.");
    }
  };

  const handleSimpleAuthSubmit = async () => {
    if (!authName || !authPhone) {
      alert("Please provide both Full Name and Mobile Number.");
      return;
    }
    setIsAuthLoading(true);

    try {
      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName,
          phone: authPhone
        })
      });

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        // Clean forms
        setAuthName("");
        setAuthPhone("");
        setActiveTab("dashboard");
      } else {
        alert(data.error || "Authentication failed.");
      }
    } catch (e) {
      alert("A system error occurred. Please verify backend state.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSendOtpSimulation = () => {
    if (!authEmail) {
      alert("Please specify email address.");
      return;
    }
    setOtpSent(true);
    alert(`Simulation: OTP Code '1234' sent to ${authEmail}`);
  };

  const handleVerifyOtpSimulation = () => {
    if (authOtp === "1234") {
      alert("Verification successful!");
      // Complete log in
      setToken("dummy-auth-token-otp");
      setUser({
        id: "otp-patient",
        name: "OTP Verified User",
        email: authEmail,
        role: "patient"
      });
      setActiveTab("dashboard");
    } else {
      alert("Incorrect OTP Code. Try '1234'!");
    }
  };

  const handlePlaceOrder = async (orderData: any) => {
    if (!token) return false;
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      if (response.ok) {
        fetchUserRecords();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleBookWithDoctorLink = (docId: string, dept: string) => {
    setPreSelectedDocId(docId);
    setPreSelectedDept(dept);
    setActiveTab("appointment");
  };

  const handleLogout = () => {
    setToken(null);
    setActiveTab("home");
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 font-sans flex flex-col justify-between relative overflow-hidden">
      <FloatingLeaves />
      {/* Dynamic Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-green-50 dark:border-slate-800/80 transition-all duration-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              setActiveTab("home");
              setPreSelectedDocId(null);
              setPreSelectedDept(null);
            }}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2E7D32] to-[#8D6E63] flex items-center justify-center text-white font-extrabold shadow-md shadow-green-100 dark:shadow-none">
              <Stethoscope size={18} />
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-sm tracking-tight leading-none text-slate-900 dark:text-white">Nirogi-TanMan</h1>
              <span className="text-[9px] font-semibold text-[#2E7D32] uppercase tracking-wider">Ayurvedic & Natural Health</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button onClick={() => { setActiveTab("home"); setPreSelectedDocId(null); }} className={`hover:text-[#2E7D32] transition ${activeTab === "home" ? "text-[#2E7D32]" : ""}`}>Home</button>
            <button onClick={() => setActiveTab("about")} className={`hover:text-[#2E7D32] transition ${activeTab === "about" ? "text-[#2E7D32]" : ""}`}>About Us</button>
            <button onClick={() => setActiveTab("services")} className={`hover:text-[#2E7D32] transition ${activeTab === "services" ? "text-[#2E7D32]" : ""}`}>Services</button>
            <button onClick={() => setActiveTab("doctors")} className={`hover:text-[#2E7D32] transition ${activeTab === "doctors" ? "text-[#2E7D32]" : ""}`}>Doctors</button>
            <button onClick={() => setActiveTab("appointment")} className={`hover:text-[#2E7D32] transition ${activeTab === "appointment" ? "text-[#2E7D32]" : ""}`}>Appointment</button>
            <button onClick={() => setActiveTab("store")} className={`hover:text-[#2E7D32] transition ${activeTab === "store" ? "text-[#2E7D32]" : ""}`}>Pharmacy</button>
            <button onClick={() => setActiveTab("blogs")} className={`hover:text-[#2E7D32] transition ${activeTab === "blogs" ? "text-[#2E7D32]" : ""}`}>Health Blog</button>
            <button onClick={() => setActiveTab("tools")} className={`hover:text-[#2E7D32] transition ${activeTab === "tools" ? "text-[#2E7D32]" : ""}`}>Wellness Calculator</button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 rounded-xl transition shrink-0"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Profile CTA */}
            {user ? (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 active:scale-95 ${
                  activeTab === "dashboard"
                    ? "bg-[#2E7D32] text-white"
                    : "bg-green-50/50 dark:bg-green-950/20 text-[#2E7D32] hover:bg-green-50 border border-green-100/40"
                }`}
              >
                <LayoutDashboard size={14} /> My Dashboard
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("login")}
                className="text-xs font-bold bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl transition shadow-md shadow-green-100 dark:shadow-none flex items-center gap-1.5"
              >
                <User size={14} /> Sign In
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 divide-y flex flex-col"
            >
              {[
                { label: "Home", tab: "home" },
                { label: "About Us", tab: "about" },
                { label: "Services Offered", tab: "services" },
                { label: "Our Doctors", tab: "doctors" },
                { label: "Book Consultation", tab: "appointment" },
                { label: "Pharmacy Store", tab: "store" },
                { label: "Health Blog", tab: "blogs" },
                { label: "Wellness Calculator", tab: "tools" }
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setPreSelectedDocId(null);
                    setPreSelectedDept(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                    activeTab === item.tab ? "text-[#2E7D32] bg-green-50/5" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {/* VIEW 1: HOME PAGE */}
            {activeTab === "home" && (
              <div className="space-y-24">
                {/* Hero Section with Embedded Video Background */}
                <div className="relative overflow-hidden min-h-[580px] rounded-[40px] flex items-center p-6 md:p-16 border border-green-100/40 shadow-xl bg-cream/20">
                  {/* YouTube Iframe Background */}
                  <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-slate-150">
                    <iframe
                      id="hero-video-iframe"
                      src="https://www.youtube.com/embed/7aFIxSyMn78?autoplay=1&mute=1&loop=1&playlist=7aFIxSyMn78&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] min-w-full h-[56.25vw] min-h-full opacity-65 dark:opacity-35 transition-opacity duration-300"
                      allow="autoplay; encrypted-media"
                      title="Ayurvedic Wellness Video"
                      style={{ border: "none" }}
                    />
                    {/* Organic warm overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF7] via-[#FCFBF7]/90 to-[#FCFBF7]/30 dark:from-slate-950 dark:via-slate-950/90 dark:to-slate-950/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBF7] via-transparent to-transparent dark:from-slate-950" />
                  </div>

                  <div className="relative z-10 max-w-xl space-y-6">
                    <span className="bg-emerald-50 dark:bg-green-950/40 text-[#2E7D32] dark:text-green-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-green-100 dark:border-green-900/40 inline-flex items-center gap-1.5 shadow-sm">
                      <Sparkles size={11} /> Integrative Ayurveda & Natural Healing
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                      Experience Pristine <br />
                      <span className="text-[#2E7D32] italic">
                        Holistic Wellness
                      </span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-sans">
                      Nirogi-TanMan unites modern clinical expertise with the eternal wisdom of organic herbs, yogic discipline, and Prakriti body-type balancing. Schedule video consultations and order AYUSH-certified remedies today.
                    </p>

                    {/* Search Bar matching nature design theme */}
                    <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2 rounded-2xl border border-green-100 dark:border-slate-800 max-w-xl shadow-lg relative z-10">
                      <div className="flex-1 flex items-center px-4 border-r border-slate-100 dark:border-slate-800">
                        <svg className="text-[#2E7D32] mr-2 shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input
                          type="text"
                          placeholder="Search Ashwagandha, Churna, or Doctors..."
                          value={heroSearchQuery}
                          onChange={(e) => setHeroSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const q = heroSearchQuery.toLowerCase();
                              if (q.includes("med") || q.includes("pill") || q.includes("ayur") || q.includes("store") || q.includes("drug") || q.includes("tablet") || q.includes("churna") || q.includes("ashwa") || q.includes("herb")) {
                                setActiveTab("store");
                              } else {
                                setActiveTab("doctors");
                              }
                            }
                          }}
                          className="bg-transparent border-none text-xs md:text-sm focus:ring-0 w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const q = heroSearchQuery.toLowerCase();
                          if (q.includes("med") || q.includes("pill") || q.includes("ayur") || q.includes("store") || q.includes("drug") || q.includes("tablet") || q.includes("churna") || q.includes("ashwa") || q.includes("herb")) {
                            setActiveTab("store");
                          } else {
                            setActiveTab("doctors");
                          }
                        }}
                        className="bg-[#2E7D32] text-white p-3 rounded-xl hover:bg-[#1B5E20] transition active:scale-95 cursor-pointer shrink-0"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab("appointment")}
                        className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-green-100 dark:shadow-none transition hover:scale-102 active:scale-95 flex items-center gap-2"
                      >
                        Book Appointment <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => setActiveTab("services")}
                        className="bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-green-100 hover:bg-white px-6 py-3 rounded-xl text-xs font-bold transition hover:scale-102 active:scale-95 backdrop-blur-sm"
                      >
                        Explore Services
                      </button>
                    </div>
                  </div>

                  {/* Volume/Mute Controller overlay bottom right */}
                  <div className="absolute bottom-6 right-6 z-20">
                    <button
                      onClick={toggleMute}
                      className="p-3 bg-white/95 dark:bg-slate-900/95 hover:bg-white text-[#2E7D32] rounded-full shadow-lg border border-green-50 transition active:scale-95 flex items-center gap-2 text-xs font-bold"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX size={15} /> <span>Unmute Video</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={15} /> <span>Mute Video</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Core Categories Hub Row */}
                <div className="space-y-6">
                  <div className="text-center space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Wellness hubs</span>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-white">Our Complete Healthcare Grid</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <button
                      onClick={() => setActiveTab("appointment")}
                      className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-green-50 hover:border-green-200 transition text-left group space-y-4 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-green-500/10 text-[#2E7D32] rounded-xl flex items-center justify-center">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#2E7D32] transition">Doctor Consultation</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Schedule instant clinical sessions with board-certified healthcare professionals.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("store")}
                      className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-green-50 hover:border-green-200 transition text-left group space-y-4 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-emerald-50 text-[#2E7D32] rounded-xl flex items-center justify-center">
                        <Pill size={20} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#2E7D32] transition">Pharmacy & Ayurveda</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Acquire certified OTC medicines, multi-vitamins, and ayurvedic remedies securely.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("tools")}
                      className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-green-50 hover:border-green-200 transition text-left group space-y-4 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-emerald-50 text-[#2E7D32] rounded-xl flex items-center justify-center">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#2E7D32] transition">Wellness Calculators</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Check your Body Mass Index, daily water intake targets, and diabetes risk scores.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("blogs")}
                      className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-green-50 hover:border-green-200 transition text-left group space-y-4 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white group-hover:text-amber-600 transition">Health Publications</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Acquire daily evidence-based nutritional plans and Ayurvedic lifestyle tutorials.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Additional nature-inspired Ayurvedic home sections component */}
                <HomeSections
                  doctors={doctors}
                  medicines={medicines}
                  onNavigateToTab={(t) => setActiveTab(t)}
                  onBookDoctor={handleBookWithDoctorLink}
                />

                {/* Bottom Stats & Features */}
                <section className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-around gap-6 md:gap-4 text-white">
                  <div className="text-center">
                    <p className="text-3xl font-serif font-black">10k+</p>
                    <p className="text-[10px] text-green-100 font-extrabold uppercase tracking-widest mt-1">Happy Patients</p>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-white/25"></div>
                  <div className="text-center">
                    <p className="text-3xl font-serif font-black">100+</p>
                    <p className="text-[10px] text-green-100 font-extrabold uppercase tracking-widest mt-1">Expert Doctors</p>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-white/25"></div>
                  <div className="text-center">
                    <p className="text-3xl font-serif font-black">98%</p>
                    <p className="text-[10px] text-green-100 font-extrabold uppercase tracking-widest mt-1">Therapeutic Success</p>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-white/25"></div>
                  <div className="flex items-center gap-4 bg-white/10 p-3 pr-6 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#2E7D32] shrink-0">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M12 15V3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Nirogi App</p>
                      <p className="text-[10px] text-green-100 opacity-80">Sync wellness profiles on-the-go</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* VIEW 2: ABOUT US */}
            {activeTab === "about" && (
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Our Legacy</span>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Nirogi-TanMan Integrative Healthcare</h2>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-xl mx-auto">
                    At Nirogi-TanMan, we integrate clinical diagnostics with physical discipline and dietary awareness to generate sustainable, disease-free lifestyles.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center pt-4">
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-white">Holistic Healing Core Philosophy</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      We believe wellness is a multi-dimensional state. Purely treating acute biological symptoms without resolving structural lifestyle stress leads to recurring chronic ailments.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      Our clinics host both specialist cardiologists/pediatricians and lifestyle consultants who tailor standard dietary recommendations and organic ayurvedic treatments.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-green-100/20 shadow-sm space-y-4">
                    <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white">Our 4 Core Vows</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-green-500/10 text-[#2E7D32] flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                        <p className="text-slate-600 dark:text-slate-300"><strong>Sterile Quality:</strong> Certified pharmacy storage under temperature regulations.</p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-green-500/10 text-[#2E7D32] flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                        <p className="text-slate-600 dark:text-slate-300"><strong>Direct Booking:</strong> Instant doctor verification queues with 0% mock waiting logs.</p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-green-500/10 text-[#2E7D32] flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                        <p className="text-slate-600 dark:text-slate-300"><strong>Lifestyle Grounding:</strong> Ancient Ayurvedic wisdom coupled with standard scientific therapy.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: SERVICES */}
            {activeTab === "services" && (
              <div className="space-y-12 max-w-5xl mx-auto">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Our Services</span>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Specialized Integrative Departments</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "General Clinical Medicine", icon: Stethoscope, desc: "Fever diagnoses, thyroid regulation, acute infectious therapies, and blood profiles." },
                    { title: "Preventive Cardiology", icon: Heart, desc: "Hypertension management, lipid panels, coronary screening, and healthy dietary routines." },
                    { title: "Panchakarma & Ayurveda", icon: Sparkles, desc: "Clinical detoxification, herbal extracts, Stress relief, and metabolic therapies." },
                    { title: "Cognitive Mental Wellness", icon: Award, desc: "Anxiety coaching, depression consultation, organic restorative yoga, and meditation plans." },
                    { title: "Pediatric Care", icon: ShieldCheck, desc: "Infant growth tracking, immunizations, and child psychological milestones counseling." },
                    { title: "Sterile Home Diagnostics", icon: Pill, desc: "At-home sterile sample collection, lipid, HbA1c, and complete metabolic assays." }
                  ].map((srv, index) => {
                    const IconComp = srv.icon;
                    return (
                      <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-green-50/40 shadow-sm space-y-4">
                        <div className="w-10 h-10 bg-emerald-50 text-[#2E7D32] rounded-xl flex items-center justify-center">
                          <IconComp size={18} />
                        </div>
                        <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white">{srv.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{srv.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 4: DOCTORS */}
            {activeTab === "doctors" && (
              <div className="space-y-10">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Our Specialists</span>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Our Board-Certified Practitioners</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                    Consult with ISO certified medical officers possessing decades of active clinical and holistic therapy experience.
                  </p>
                </div>

                <DoctorsView doctors={doctors} onBookWithDoctor={handleBookWithDoctorLink} initialSearchTerm={heroSearchQuery} />
              </div>
            )}

            {/* VIEW 5: APPOINTMENT FLOW */}
            {activeTab === "appointment" && (
              <div className="space-y-8">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Reservation</span>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Schedule Clinical Consultation</h3>
                </div>

                <BookAppointmentFlow
                  user={user}
                  doctors={doctors}
                  token={token}
                  onBookingComplete={fetchUserRecords}
                  preSelectedDoctorId={preSelectedDocId}
                  preSelectedDepartment={preSelectedDept}
                  onNavigateToTab={(t) => setActiveTab(t)}
                />
              </div>
            )}

            {/* VIEW 6: PHARMACY STORE */}
            {activeTab === "store" && (
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Pharmacy</span>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Prescription & Organic Ayurveda Store</h3>
                </div>

                <MedicineStoreView
                  medicines={medicines}
                  user={user}
                  token={token}
                  onPlaceOrder={handlePlaceOrder}
                  onNavigateToTab={(t) => setActiveTab(t)}
                  initialSearchTerm={heroSearchQuery}
                />
              </div>
            )}

            {/* VIEW 7: BLOGS */}
            {activeTab === "blogs" && (
              <div className="space-y-8">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Publications</span>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Evidence-Based Lifestyle Articles</h3>
                </div>

                <MedicalBlog />
              </div>
            )}

            {/* VIEW 8: WELLNESS CALCULATORS */}
            {activeTab === "tools" && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Metabolic Vitals</span>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Wellness & Biomarker Calculators</h3>
                </div>

                <HealthTools />
              </div>
            )}

            {/* VIEW 9: LOGIN & SIGNUP SCREEN */}
            {(activeTab === "login" || activeTab === "signup") && (
              <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/60 space-y-6 text-xs animate-fadeIn">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Welcome to Nirogi-TanMan</h3>
                  <p className="text-slate-400">Enter your name and mobile number to Sign In or Register instantly.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="E.g., Raj Lalit"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="E.g., 9876543210"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]"
                    />
                  </div>

                  <button
                    onClick={handleSimpleAuthSubmit}
                    disabled={isAuthLoading}
                    className="w-full bg-[#0F9D58] hover:bg-[#0B7D45] text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isAuthLoading ? "Connecting Securely..." : "Sign In & Continue"}
                  </button>
                </div>

                <div className="text-center text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <p className="text-[10px]">No password, OTP, or verification code required. Secure, simple, and instant.</p>
                </div>
              </div>
            )}

            {/* VIEW 11: MULTI-ROLE DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <DashboardsView
                  user={user}
                  token={token}
                  appointments={appointments}
                  doctors={doctors}
                  orders={orders}
                  onRefresh={fetchUserRecords}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Floating AI Chat Widget Assistant */}
      <AiAssistant />

      {/* Aesthetic Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 py-10 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center font-bold">N</div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Nirogi-TanMan</h4>
            </div>
            <p className="text-[11px] leading-relaxed">
              Standard clinical diagnostics coupled with Ayurvedic healing. ISO sterile pharmacy dispatch and video consultations.
            </p>
            <span className="text-[10px] text-slate-400 block font-semibold">© 2026 Nirogi-TanMan. All Vows Honored.</span>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Integrative Care</h5>
            <div className="flex flex-col gap-1.5 font-medium">
              <button onClick={() => setActiveTab("doctors")} className="text-left hover:text-[#0F9D58]">Specialist Doctors</button>
              <button onClick={() => setActiveTab("store")} className="text-left hover:text-[#0F9D58]">Panchakarma Ayurveda Store</button>
              <button onClick={() => setActiveTab("tools")} className="text-left hover:text-[#0F9D58]">HbA1c & BMI Calculators</button>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Medical Ethics</h5>
            <div className="flex flex-col gap-1.5 font-medium">
              <span>Sterile ISO Standard 9001</span>
              <span>AYUSH Certified Herbs</span>
              <span>100% Secure Telehealth Encryption</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Clinic Coordinates</h5>
            <div className="space-y-1.5 font-medium">
              <span className="flex items-center gap-1"><MapPin size={12} /> Metro Pillar 402, Noida Sector 62</span>
              <span className="flex items-center gap-1"><Phone size={12} /> +91 98765 43210</span>
              <span className="flex items-center gap-1"><Mail size={12} /> wellness@nirogitanman.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
