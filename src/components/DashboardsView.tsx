import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  ShoppingBag,
  Settings,
  LogOut,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  DollarSign,
  Heart,
  Briefcase,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  Clipboard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Appointment, Order, User as UserType } from "../types";

interface DashboardsViewProps {
  user: UserType | null;
  token: string | null;
  appointments: Appointment[];
  doctors: UserType[];
  orders: Order[];
  onRefresh: () => void;
  onLogout: () => void;
}

export default function DashboardsView({
  user,
  token,
  appointments,
  doctors,
  orders,
  onRefresh,
  onLogout
}: DashboardsViewProps) {
  // Common states
  const [activeTab, setActiveTab] = useState("overview");

  // Patient settings profile states
  const [pAge, setPAge] = useState(user?.age || 28);
  const [pGender, setPGender] = useState(user?.gender || "Male");
  const [pBlood, setPBlood] = useState(user?.bloodGroup || "O+");
  const [pHeight, setPHeight] = useState(user?.height || "178 cm");
  const [pWeight, setPWeight] = useState(user?.weight || "72 kg");
  const [pAddress, setPAddress] = useState(user?.address || "");
  const [pEmergency, setPEmergency] = useState(user?.emergencyContact || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Doctor consultation state
  const [selectedConsultation, setSelectedConsultation] = useState<Appointment | null>(null);
  const [diagNotes, setDiagNotes] = useState("");
  const [diagPresc, setDiagPresc] = useState("");
  const [isFinishingConsult, setIsFinishingConsult] = useState(false);

  // Admin states
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("All");

  // Admin Book On Behalf form state
  const [behalfName, setBehalfName] = useState("");
  const [behalfPhone, setBehalfPhone] = useState("");
  const [behalfEmail, setBehalfEmail] = useState("");
  const [behalfAge, setBehalfAge] = useState("30");
  const [behalfGender, setBehalfGender] = useState("Male");
  const [behalfBlood, setBehalfBlood] = useState("O+");
  const [behalfDocId, setBehalfDocId] = useState("");
  const [behalfDate, setBehalfDate] = useState("");
  const [behalfTime, setBehalfTime] = useState("10:30 AM");
  const [behalfSymptoms, setBehalfSymptoms] = useState("");
  const [behalfHistory, setBehalfHistory] = useState("");
  const [behalfConsultType, setBehalfConsultType] = useState<"Offline" | "Online">("Offline");
  const [behalfPriority, setBehalfPriority] = useState<"Normal" | "Urgent" | "Emergency">("Normal");
  const [behalfPayment, setBehalfPayment] = useState("Paid");
  const [isBookingBehalf, setIsBookingBehalf] = useState(false);

  // Patient profiles list fetched by admin for search lookup
  const [patientProfiles, setPatientProfiles] = useState<UserType[]>([]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/patients", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.patients) setPatientProfiles(data.patients);
        });
    }
  }, [user, token]);

  // Handle Behalf patient autocomplete search
  const handlePatientAutocomplete = (query: string) => {
    setBehalfName(query);
    const matched = patientProfiles.find(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query) ||
        p.id.includes(query)
    );
    if (matched) {
      setBehalfPhone(matched.phone || "");
      setBehalfEmail(matched.email || "");
      setBehalfAge(matched.age?.toString() || "30");
      setBehalfGender(matched.gender || "Male");
      setBehalfBlood(matched.bloodGroup || "O+");
    }
  };

  const handleUpdateProfileSubmit = async () => {
    setIsUpdatingProfile(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          age: Number(pAge),
          gender: pGender,
          bloodGroup: pBlood,
          height: pHeight,
          weight: pWeight,
          address: pAddress,
          emergencyContact: pEmergency
        })
      });
      const data = await response.json();
      if (data.user) {
        alert("Your profile vitals have been successfully updated.");
        onRefresh();
      }
    } catch (e) {
      alert("Failed updating vitals. Server error.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateAptStatus = async (aptId: string, status: string, note: string) => {
    try {
      const response = await fetch(`/api/appointments/${aptId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, note })
      });
      if (response.ok) {
        alert(`Appointment status transitioned to: ${status}`);
        onRefresh();
      }
    } catch (e) {
      alert("Status transition failed.");
    }
  };

  const handleSaveConsultation = async () => {
    if (!selectedConsultation) return;
    setIsFinishingConsult(true);
    try {
      const response = await fetch(`/api/appointments/${selectedConsultation.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "Completed",
          note: "Consultation successfully finished. Prescription dispatched.",
          doctorNotes: diagNotes,
          prescription: diagPresc
        })
      });
      if (response.ok) {
        alert("Consultation finalized! Health logs updated.");
        setSelectedConsultation(null);
        setDiagNotes("");
        setDiagPresc("");
        onRefresh();
      }
    } catch (e) {
      alert("Finalization failed.");
    } finally {
      setIsFinishingConsult(false);
    }
  };

  const handleBookBehalfSubmit = async () => {
    if (!behalfName || !behalfPhone || !behalfDocId) {
      alert("Please fill name, phone, and doctor.");
      return;
    }
    setIsBookingBehalf(true);
    try {
      const doc = doctors.find((d) => d.id === behalfDocId);
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName: behalfName,
          mobileNumber: behalfPhone,
          emailAddress: behalfEmail,
          age: behalfAge,
          gender: behalfGender,
          bloodGroup: behalfBlood,
          doctorId: behalfDocId,
          department: doc?.specialization || "General Medicine",
          appointmentDate: behalfDate || new Date().toISOString().split("T")[0],
          appointmentTime: behalfTime,
          symptoms: behalfSymptoms,
          medicalHistory: behalfHistory,
          consultationType: behalfConsultType,
          priority: behalfPriority,
          paymentStatus: behalfPayment
        })
      });
      if (response.ok) {
        alert("Appointment booked successfully on behalf of patient!");
        setBehalfName("");
        setBehalfPhone("");
        setBehalfEmail("");
        setBehalfSymptoms("");
        setBehalfHistory("");
        onRefresh();
      }
    } catch (e) {
      alert("Error booking.");
    } finally {
      setIsBookingBehalf(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200";
      case "Checked In":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200";
      case "In Consultation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border-green-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-400 border-slate-200";
    }
  };

  if (!user) return null;

  return (
    <div className="grid md:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between space-y-6 h-fit">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="w-11 h-11 bg-[#0F9D58]/10 text-[#0F9D58] font-bold rounded-xl flex items-center justify-center border border-green-100 uppercase shrink-0">
              {user.name.slice(0, 2)}
            </div>
            <div className="truncate">
              <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{user.name}</h4>
              <span className="text-[10px] text-[#0F9D58] font-extrabold uppercase tracking-widest block">
                {user.role} Portal
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-semibold">
            {user.role === "patient" && (
              <>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === "overview" ? "bg-[#0F9D58] text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  My Appointments
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === "orders" ? "bg-[#0F9D58] text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Medicine Orders
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === "profile" ? "bg-[#0F9D58] text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Health Vitals & Profile
                </button>
              </>
            )}

            {user.role === "doctor" && (
              <>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === "overview" ? "bg-[#0F9D58] text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Active Consultations
                </button>
              </>
            )}

            {user.role === "admin" && (
              <>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === "analytics" ? "bg-[#0F9D58] text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Overview & Analytics
                </button>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === "overview" ? "bg-[#0F9D58] text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Manage Appointments
                </button>
                <button
                  onClick={() => setActiveTab("behalf")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    activeTab === "behalf" ? "bg-[#0F9D58] text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Book On Behalf
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <button
            onClick={onRefresh}
            className="w-full text-left text-xs text-slate-500 hover:text-slate-800 flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-lg"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="md:col-span-3">
        <AnimatePresence mode="wait">
          {/* PATIENT OVERVIEW: appointments list */}
          {user.role === "patient" && activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Active Consultations</h4>
                <span className="text-xs bg-green-50 text-[#0F9D58] px-3 py-1 rounded-full font-bold">
                  {appointments.length} Saved Bookings
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border text-center text-slate-400">
                  No appointments registered yet. Click "Book Appointment" to secure your slot!
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">ID: #{apt.id}</span>
                          <h5 className="font-bold text-sm text-slate-800 dark:text-white">{apt.doctorName}</h5>
                          <p className="text-[10px] text-slate-400">{apt.department}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border uppercase ${getStatusColor(apt.appointmentStatus)}`}>
                            {apt.appointmentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5"><Calendar size={13} className="text-[#0F9D58]" /> <strong>Date:</strong> {apt.appointmentDate}</div>
                        <div className="flex items-center gap-1.5"><Clock size={13} className="text-[#1E88E5]" /> <strong>Time:</strong> {apt.appointmentTime}</div>
                        <div className="flex items-center gap-1.5"><Layers size={13} className="text-slate-400" /> <strong>Priority:</strong> {apt.priority}</div>
                      </div>

                      {/* Timeline status list */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800 space-y-2">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">Consultation Stage Timeline</span>
                        <div className="flex overflow-x-auto gap-4 pb-1">
                          {apt.timeline.map((step, sIdx) => (
                            <div key={sIdx} className="whitespace-nowrap shrink-0 flex items-center gap-2">
                              <div>
                                <span className="font-bold text-[10px] block text-[#0F9D58]">{step.status}</span>
                                <span className="text-[8px] text-slate-400 block">{new Date(step.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              {sIdx < apt.timeline.length - 1 && <span className="text-slate-300">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Display Prescription if completed */}
                      {apt.prescription && (
                        <div className="bg-green-50/50 dark:bg-green-950/25 p-4 rounded-xl border border-green-100/50 dark:border-green-900/30 space-y-2">
                          <span className="text-[10px] font-extrabold text-[#0F9D58] uppercase flex items-center gap-1">
                            <Clipboard size={12} /> Digital Rx Prescription Issued
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{apt.prescription}</p>
                          {apt.doctorNotes && <p className="text-[10px] text-slate-400 font-medium">Doc notes: {apt.doctorNotes}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PATIENT ORDERS */}
          {user.role === "patient" && activeTab === "orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">Medicine Dispatch Tracking</h4>

              {orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl text-center text-slate-400">
                  No orders placed yet. Head over to the Medicine Store to order wellness products!
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-3 shadow-sm"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                        <div>
                          <span className="text-[9px] font-mono text-slate-400 font-bold block">Invoice: #{order.id}</span>
                          <span className="text-[10px] text-slate-500">Scheduled: {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="bg-green-50 text-[#0F9D58] px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border border-green-200">
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Ordered Inventory</span>
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between font-medium text-slate-600 dark:text-slate-300">
                            <span>{it.name} (x{it.quantity})</span>
                            <span>₹ {it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2 flex justify-between font-bold text-slate-800 dark:text-white">
                        <span>Total Paid</span>
                        <span className="text-[#0F9D58]">₹ {order.grandTotal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PATIENT HEALTH PROFILE AND VITALS */}
          {user.role === "patient" && activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F9D58]">Metabolic Vitals</span>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-1">Holistic Health Profile</h4>
                <p className="text-slate-400 text-xs leading-relaxed mt-0.5">Maintain active cardiovascular indicators so doctors can tailor diagnostics precisely.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={pAge}
                    onChange={(e) => setPAge(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blood Group</label>
                  <select
                    value={pBlood}
                    onChange={(e) => setPBlood(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Height</label>
                  <input
                    type="text"
                    value={pHeight}
                    onChange={(e) => setPHeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Weight</label>
                  <input
                    type="text"
                    value={pWeight}
                    onChange={(e) => setPWeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Emergency contact telephone</label>
                  <input
                    type="text"
                    value={pEmergency}
                    onChange={(e) => setPEmergency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Residential Address</label>
                  <textarea
                    value={pAddress}
                    onChange={(e) => setPAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateProfileSubmit}
                disabled={isUpdatingProfile}
                className="w-full bg-[#0F9D58] hover:bg-[#0B7D45] text-white py-3 rounded-xl font-bold text-xs transition"
              >
                {isUpdatingProfile ? "Updating vitals..." : "Save Health Vitals"}
              </button>
            </motion.div>
          )}

          {/* DOCTOR OVERVIEW */}
          {user.role === "doctor" && activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Active Consultations</h4>
                <span className="text-xs bg-green-50 text-[#0F9D58] px-3 py-1 rounded-full font-bold">
                  {appointments.length} Assigned Patients
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border text-center text-slate-400">
                  No active scheduled patient consultations allocated. Click "Refresh" to pool again.
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">ID: #{apt.id} | Priority: {apt.priority}</span>
                          <h5 className="font-bold text-sm text-slate-800 dark:text-white">Patient: {apt.patientName}</h5>
                          <p className="text-[10px] text-slate-400">Symptom details: {apt.symptoms || "None declared"}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border uppercase ${getStatusColor(apt.appointmentStatus)}`}>
                          {apt.appointmentStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
                        <div className="flex gap-4">
                          <span><strong>Mode:</strong> {apt.consultationType}</span>
                          <span><strong>Time:</strong> {apt.appointmentDate} at {apt.appointmentTime}</span>
                        </div>

                        <div className="flex gap-2">
                          {apt.appointmentStatus === "Pending" && (
                            <button
                              onClick={() => handleUpdateAptStatus(apt.id, "Confirmed", "Accepted by Practitioner.")}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold"
                            >
                              Accept
                            </button>
                          )}
                          {apt.appointmentStatus === "Confirmed" && (
                            <button
                              onClick={() => handleUpdateAptStatus(apt.id, "Checked In", "Patient checked in clinic corridor.")}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold"
                            >
                              Checked In
                            </button>
                          )}
                          {(apt.appointmentStatus === "Checked In" || apt.appointmentStatus === "Confirmed") && (
                            <button
                              onClick={() => {
                                setSelectedConsultation(apt);
                                setDiagNotes(apt.doctorNotes || "");
                                setDiagPresc(apt.prescription || "");
                              }}
                              className="bg-[#0F9D58] hover:bg-[#0B7D45] text-white px-3 py-1.5 rounded-lg font-bold"
                            >
                              Start Consult
                            </button>
                          )}
                        </div>
                      </div>

                      {apt.prescription && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                          <strong className="block text-[10px] text-[#0F9D58]">Prescription:</strong>
                          <p className="font-mono mt-1 text-slate-600 dark:text-slate-300">{apt.prescription}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Consultation Diagnostic Drawer */}
              {selectedConsultation && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-5 text-xs"
                  >
                    <div className="flex justify-between items-center pb-3 border-b">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Active consultation: {selectedConsultation.patientName}</h4>
                      <button onClick={() => setSelectedConsultation(null)} className="text-slate-400 text-sm font-bold">X</button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Clinical Diagnosis Notes</label>
                        <textarea
                          rows={3}
                          value={diagNotes}
                          onChange={(e) => setDiagNotes(e.target.value)}
                          placeholder="Type symptom analysis, recommended diagnostic tests, pulse details, etc."
                          className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Prescription Rx (Medicine & Dosage directions)</label>
                        <textarea
                          rows={3}
                          value={diagPresc}
                          onChange={(e) => setDiagPresc(e.target.value)}
                          placeholder="E.g., Paracetamol 650mg - 1-0-1 after meals for 3 days."
                          className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 focus:outline-none font-mono text-xs text-green-700"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedConsultation(null)}
                        className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveConsultation}
                        disabled={isFinishingConsult}
                        className="flex-[2] bg-[#0F9D58] hover:bg-[#0B7D45] text-white py-3 rounded-xl font-bold"
                      >
                        {isFinishingConsult ? "Dispatching Rx..." : "Generate Prescription & Complete"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* ADMIN OVERVIEW & ANALYTICS */}
          {user.role === "admin" && activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Counter Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Appointments</span>
                  <div className="text-2xl font-black mt-1 text-[#0F9D58]">{appointments.length}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Medical Staff</span>
                  <div className="text-2xl font-black mt-1 text-[#1E88E5]">{doctors.length} Doctors</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Income</span>
                  <div className="text-2xl font-black mt-1 text-green-600">
                    ₹ {appointments.filter((a) => a.paymentStatus === "Paid").length * 500}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">User Base</span>
                  <div className="text-2xl font-black mt-1 text-slate-700 dark:text-slate-200">
                    {patientProfiles.length + doctors.length + 1}
                  </div>
                </div>
              </div>

              {/* Inline SVG Charts Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border space-y-4">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">Weekly Consultation Trends</h5>
                  <div className="h-44 w-full flex items-end justify-between px-4 pb-2 border-b">
                    {/* SVG Line Graph */}
                    <svg viewBox="0 0 300 100" className="w-full h-full stroke-current text-[#0F9D58] fill-none">
                      <path d="M 0 80 Q 50 30 100 60 T 200 10 T 300 40" strokeWidth="3" />
                      <circle cx="50" cy="55" r="4" fill="#0F9D58" />
                      <circle cx="150" cy="35" r="4" fill="#0F9D58" />
                      <circle cx="250" cy="25" r="4" fill="#0F9D58" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border space-y-4">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">Appointments by status</h5>
                  <div className="flex items-center justify-around h-44">
                    {/* Circular SVG Pie */}
                    <svg viewBox="0 0 32 32" className="w-32 h-32 transform -rotate-90">
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#0F9D58" strokeWidth="4" strokeDasharray="65 100" />
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#1E88E5" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-65" />
                    </svg>
                    <div className="text-[10px] space-y-1.5">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0F9D58] rounded-md"></span> Completed (65%)</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#1E88E5] rounded-md"></span> Confirmed (25%)</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-300 rounded-md"></span> Pending (10%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADMIN OVERVIEW: Manage All Appointments table */}
          {user.role === "admin" && activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <h4 className="text-base font-bold text-slate-800 dark:text-white">System Appointments Database</h4>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search ID, name, doctor..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 text-xs border rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b">
                      <th className="p-4">Appointment ID</th>
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Doctor Assigned</th>
                      <th className="p-4">Scheduled Date</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Live Status</th>
                      <th className="p-4 text-right">Transition Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter((apt) => {
                        const s = adminSearch.toLowerCase();
                        return (
                          apt.id.toLowerCase().includes(s) ||
                          apt.patientName.toLowerCase().includes(s) ||
                          apt.doctorName.toLowerCase().includes(s)
                        );
                      })
                      .map((apt) => (
                        <tr key={apt.id} className="border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                          <td className="p-4 font-mono font-bold">#{apt.id}</td>
                          <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{apt.patientName}</td>
                          <td className="p-4 text-slate-500">{apt.doctorName}</td>
                          <td className="p-4 text-slate-500">{apt.appointmentDate}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${apt.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {apt.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${getStatusColor(apt.appointmentStatus)}`}>
                              {apt.appointmentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={apt.appointmentStatus}
                              onChange={(e) => handleUpdateAptStatus(apt.id, e.target.value, "Admin status override.")}
                              className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold border rounded p-1"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Checked In">Checked In</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ADMIN: Book Appointment On Behalf of patient (with auto-register) */}
          {user.role === "admin" && activeTab === "behalf" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F9D58]">Admin Command Center</span>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-1">Book Appointment on Patient Behalf</h4>
                <p className="text-slate-400 text-xs">Type existing patient's name to autocomplete, or enter new credentials to automatically register them on the fly.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search Patient Name</label>
                  <input
                    type="text"
                    value={behalfName}
                    onChange={(e) => handlePatientAutocomplete(e.target.value)}
                    placeholder="Search name/ID or enter new patient..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={behalfPhone}
                    onChange={(e) => setBehalfPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={behalfEmail}
                    onChange={(e) => setBehalfEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      value={behalfAge}
                      onChange={(e) => setBehalfAge(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                    <select
                      value={behalfGender}
                      onChange={(e) => setBehalfGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Assign Doctor</label>
                  <select
                    value={behalfDocId}
                    onChange={(e) => setBehalfDocId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                  >
                    <option value="">-- Choose practitioner --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Date</label>
                  <input
                    type="date"
                    value={behalfDate}
                    onChange={(e) => setBehalfDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Symptoms Description</label>
                  <textarea
                    value={behalfSymptoms}
                    onChange={(e) => setBehalfSymptoms(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F9D58]"
                  />
                </div>
              </div>

              <button
                onClick={handleBookBehalfSubmit}
                disabled={isBookingBehalf}
                className="w-full bg-[#0F9D58] hover:bg-[#0B7D45] text-white py-3 rounded-xl font-bold text-xs"
              >
                {isBookingBehalf ? "Filing appointment..." : "Submit Patient Appointment"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
