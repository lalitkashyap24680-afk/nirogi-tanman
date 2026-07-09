import { useState, useEffect } from "react";
import { Check, Calendar, Clock, User, Heart, CreditCard, ChevronRight, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { User as UserType } from "../types";

interface BookAppointmentFlowProps {
  user: UserType | null;
  doctors: UserType[];
  token: string | null;
  onBookingComplete: () => void;
  preSelectedDoctorId?: string | null;
  preSelectedDepartment?: string | null;
  onNavigateToTab?: (tab: string) => void;
}

export default function BookAppointmentFlow({
  user,
  doctors,
  token,
  onBookingComplete,
  preSelectedDoctorId,
  preSelectedDepartment,
  onNavigateToTab
}: BookAppointmentFlowProps) {
  const [step, setStep] = useState(1);

  // Form states
  const [department, setDepartment] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [consultType, setConsultType] = useState<"Offline" | "Online">("Offline");
  const [priority, setPriority] = useState<"Normal" | "Urgent" | "Emergency">("Normal");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [coupon, setCoupon] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // Completion state
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<{ success: boolean; error?: string; schema?: string } | null>(null);
  const [showSQL, setShowSQL] = useState(false);

  // Auto-fill user details if logged in
  useEffect(() => {
    if (user) {
      setPatientName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setAge(user.age?.toString() || "28");
      setGender(user.gender || "Male");
      setBloodGroup(user.bloodGroup || "O+");
    }
  }, [user]);

  // Handle pre-selection
  useEffect(() => {
    if (preSelectedDoctorId) {
      setDoctorId(preSelectedDoctorId);
      const doc = doctors.find((d) => d.id === preSelectedDoctorId);
      if (doc && doc.specialization) {
        setDepartment(doc.specialization);
      }
      setStep(3); // Skip straight to Date select
    } else if (preSelectedDepartment) {
      setDepartment(preSelectedDepartment);
      setStep(2); // Skip to Doctor select
    }
  }, [preSelectedDoctorId, preSelectedDepartment, doctors]);

  const departments = [
    { name: "General Medicine", desc: "Common cold, fevers, general metabolic diagnostics." },
    { name: "Cardiology", desc: "Heart checkups, cholesterol, hypertensive guidance." },
    { name: "Psychiatry", desc: "Mental wellness counseling, cognitive stress therapy." },
    { name: "Ayurveda & Yoga", desc: "Holistic detox therapy, Panchakarma prescriptions." },
    { name: "Pediatrics", desc: "Child immunizations, growth monitoring, infant care." }
  ];

  const filteredDoctors = doctors.filter((doc) => doc.specialization === department);

  const timeSlots = [
    { label: "Morning 10:30 AM", value: "10:30 AM" },
    { label: "Morning 11:30 AM", value: "11:30 AM" },
    { label: "Afternoon 02:30 PM", value: "02:30 PM" },
    { label: "Afternoon 03:30 PM", value: "03:30 PM" },
    { label: "Evening 05:30 PM", value: "05:30 PM" },
    { label: "Evening 06:30 PM", value: "06:30 PM" }
  ];

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "TANMAN50") {
      setDiscountAmount(150); // Flat 150 discount
    } else {
      alert("Invalid Coupon Code. Try 'TANMAN50' for ₹ 150 off!");
    }
  };

  const selectedDoctorObj = doctors.find((d) => d.id === doctorId);
  const baseFee = selectedDoctorObj?.consultationFee || 500;
  const gst = Math.round(baseFee * 0.12);
  const grandTotal = Math.max(0, baseFee + gst - discountAmount);

  const handleSubmitBooking = async () => {
    if (!token) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName,
          mobileNumber: phone,
          emailAddress: email,
          age,
          gender,
          bloodGroup,
          doctorId,
          department,
          appointmentDate: date,
          appointmentTime: timeSlot,
          symptoms,
          medicalHistory: history,
          consultationType: consultType,
          priority,
          paymentStatus: paymentMethod === "COD" ? "Unpaid" : "Paid"
        })
      });

      const data = await response.json();
      if (data.appointment) {
        setBookingId(data.appointment.id);
        if (data.supabaseSync) {
          setSupabaseSyncResult(data.supabaseSync);
        }
        setStep(7);
        onBookingComplete();
      } else {
        alert(data.error || "Booking failed. Please try again.");
      }
    } catch (e) {
      alert("Server error during appointment creation. Check logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 text-center space-y-4 max-w-md mx-auto animate-fadeIn">
        <AlertCircle size={48} className="text-[#0F9D58] mx-auto animate-pulse" />
        <h4 className="text-lg font-bold text-slate-800 dark:text-white">Sign In Required</h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Please sign in with your Name and Mobile Number to book a consultation, view practitioner availability, and track your history.
        </p>
        <button
          onClick={() => onNavigateToTab?.("login")}
          className="w-full bg-[#0F9D58] hover:bg-[#0B7D45] text-white py-3 rounded-xl font-semibold text-xs transition cursor-pointer"
        >
          Sign In with Name & Mobile No.
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 max-w-3xl mx-auto">
      {/* Progress Bar */}
      {step < 7 && (
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            <span>Step {step} of 6</span>
            <span>
              {step === 1 && "Select Specialty"}
              {step === 2 && "Choose Practitioner"}
              {step === 3 && "Select Appointment Date"}
              {step === 4 && "Select Consultation Time"}
              {step === 5 && "Fill Medical Information"}
              {step === 6 && "Process Safe Payment"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0F9D58] to-[#1E88E5] transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Step Contents */}
      <div className="min-h-[300px]">
        {/* Step 1: Department selection */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Choose Healthcare Specialty</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {departments.map((d) => (
                <button
                  key={d.name}
                  onClick={() => {
                    setDepartment(d.name);
                    setStep(2);
                  }}
                  className={`p-5 rounded-2xl border text-left transition duration-200 active:scale-98 ${
                    department === d.name
                      ? "border-[#0F9D58] bg-green-50/20 dark:bg-green-950/20"
                      : "border-slate-100 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">{d.name}</h5>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 leading-relaxed">{d.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Choose Doctor */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">Choose Your Doctor</h4>
              <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:underline">Change Specialty</button>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="text-center p-8 text-slate-400">
                No doctors registered under {department} yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setDoctorId(doc.id);
                      setStep(3);
                    }}
                    className={`p-4 rounded-2xl border text-left transition duration-200 flex gap-4 active:scale-98 ${
                      doctorId === doc.id
                        ? "border-[#0F9D58] bg-green-50/20"
                        : "border-slate-100 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <img src={doc.avatar} alt={doc.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">{doc.name}</h5>
                      <p className="text-[10px] text-slate-400 font-medium">{doc.qualification}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Fee: <span className="font-bold text-[#0F9D58]">₹ {doc.consultationFee}</span></p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Date selection */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">Select Appointment Date</h4>
              <button onClick={() => setStep(2)} className="text-xs text-slate-400 hover:underline">Change Doctor</button>
            </div>
            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Consultation Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                * Real-time slot reservation secures this booking instantly upon checking out.
              </p>
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={() => setStep(2)} className="text-xs font-semibold text-slate-500 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Back</button>
              <button
                disabled={!date}
                onClick={() => setStep(4)}
                className="bg-[#0F9D58] hover:bg-[#0B7D45] text-white px-6 py-2.5 rounded-xl font-semibold text-xs disabled:opacity-50"
              >
                Select Time Slot
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Select Time Slot */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">Select Available Time Slot</h4>
              <button onClick={() => setStep(3)} className="text-xs text-slate-400 hover:underline">Change Date</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => setTimeSlot(slot.value)}
                  className={`p-3.5 rounded-xl border text-center transition duration-150 font-medium text-xs active:scale-95 ${
                    timeSlot === slot.value
                      ? "border-[#0F9D58] bg-green-50/20 text-[#0F9D58]"
                      : "border-slate-100 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-700 mt-4">
              <button onClick={() => setStep(3)} className="text-xs font-semibold text-slate-500 px-4 py-2 hover:bg-slate-100 rounded-lg">Back</button>
              <button
                disabled={!timeSlot}
                onClick={() => setStep(5)}
                className="bg-[#0F9D58] hover:bg-[#0B7D45] text-white px-6 py-2.5 rounded-xl font-semibold text-xs disabled:opacity-50"
              >
                Continue to Details
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Patient Details */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Patient Profile & Symptoms</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Consultation Mode</label>
                <div className="flex gap-4 text-xs font-medium">
                  <label className="flex items-center gap-1.5"><input type="radio" checked={consultType === "Offline"} onChange={() => setConsultType("Offline")} className="accent-[#0F9D58]" /> Clinic Visit</label>
                  <label className="flex items-center gap-1.5"><input type="radio" checked={consultType === "Online"} onChange={() => setConsultType("Online")} className="accent-[#0F9D58]" /> Telehealth Video Call</label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                >
                  <option value="Normal">Normal Booking</option>
                  <option value="Urgent">Urgent Consultation</option>
                  <option value="Emergency">Emergency Room Referral</option>
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Describe Symptoms / Illness</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={2}
                  placeholder="E.g., high body temperature for 2 days, chest congestion, etc."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-700 mt-4">
              <button onClick={() => setStep(4)} className="text-xs font-semibold text-slate-500 px-4 py-2 hover:bg-slate-100 rounded-lg">Back</button>
              <button
                disabled={!patientName || !phone}
                onClick={() => setStep(6)}
                className="bg-[#0F9D58] hover:bg-[#0B7D45] text-white px-6 py-2.5 rounded-xl font-semibold text-xs disabled:opacity-50"
              >
                Proceed to Payment
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 6: Payment simulation */}
        {step === 6 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Process Consultation Fee</h4>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Checkout details */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Pricing Invoice</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor Consultation Fee</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">₹ {baseFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CGST + SGST (12%)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">₹ {gst}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Coupon Discount</span>
                      <span>- ₹ {discountAmount}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-bold text-sm text-slate-800 dark:text-white">
                    <span>Grand Total Due</span>
                    <span className="text-[#0F9D58]">₹ {grandTotal}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. TANMAN50)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[#0F9D58] focus:outline-none"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-[#0F9D58] hover:bg-[#0B7D45] text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Payment selection */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Select Payment Method</span>
                <button
                  onClick={() => setPaymentMethod("UPI")}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                    paymentMethod === "UPI" ? "border-[#0F9D58] bg-green-50/10 text-[#0F9D58]" : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <span>UPI / Instant NetBanking</span>
                  <span className="text-[10px] bg-[#0F9D58]/10 text-[#0F9D58] px-2 py-0.5 rounded-md">Popular</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("Card")}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                    paymentMethod === "Card" ? "border-[#0F9D58] bg-green-50/10 text-[#0F9D58]" : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <span>Credit / Debit Card</span>
                  <CreditCard size={15} />
                </button>
                <button
                  onClick={() => setPaymentMethod("COD")}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                    paymentMethod === "COD" ? "border-[#0F9D58] bg-green-50/10 text-[#0F9D58]" : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <span>Pay Cash at Clinic (unpaid check-in)</span>
                  <Clock size={15} />
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-700 mt-4">
              <button onClick={() => setStep(5)} className="text-xs font-semibold text-slate-500 px-4 py-2 hover:bg-slate-100 rounded-lg">Back</button>
              <button
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="bg-[#0F9D58] hover:bg-[#0B7D45] text-white px-8 py-3 rounded-xl font-bold text-xs transition shadow-lg shadow-green-100 dark:shadow-none flex items-center gap-1.5 active:scale-95 duration-100"
              >
                {isSubmitting ? "Securing Session..." : `Pay ₹ ${grandTotal} & Secure Appointment`}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 7: Completed confirmation */}
        {step === 7 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center mx-auto text-2xl font-bold animate-pulse">
              <Check size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-[#0F9D58] tracking-widest block">Consultation Booked!</span>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white">Your Health, Our Priority</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto">
                Your appointment ID is <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">#{bookingId}</span>. A verification email and WhatsApp notification with clinic coordinates have been successfully dispatched.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs text-left space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Practitioner:</span> <span className="font-bold text-slate-700 dark:text-slate-200">{selectedDoctorObj?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Department:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{department}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Scheduled:</span> <span className="font-bold text-[#1E88E5]">{date} at {timeSlot}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Patient:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{patientName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Consultation mode:</span> <span className="font-semibold text-slate-700 dark:text-slate-200">{consultType}</span></div>
            </div>

            {supabaseSyncResult && (
              <div className="text-left border rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/60 text-xs">
                {supabaseSyncResult.success ? (
                  <div className="flex items-start gap-2 text-green-600 dark:text-green-400 font-medium">
                    <Check size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Successfully Synced to Supabase!</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Stored automatically in your database table 'appointments' using '{supabaseSyncResult.schema || 'camelCase'}' column naming conventions.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 font-medium">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Local Booking Succeeded (Supabase Pending)</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                          The local appointment was successfully registered, but syncing to your Supabase table failed: <span className="font-mono text-red-500 dark:text-red-400">{supabaseSyncResult.error}</span>.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSQL(!showSQL)}
                      className="text-[10px] font-bold text-[#1E88E5] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      {showSQL ? "Hide SQL Table Setup Command" : "View SQL Setup Command for Supabase"}
                    </button>

                    {showSQL && (
                      <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[9px] text-slate-600 dark:text-slate-400 overflow-x-auto select-all whitespace-pre leading-normal">
{`-- Paste this into your Supabase SQL Editor to create the table:
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  doctor_id TEXT,
  doctor_name TEXT,
  department TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  symptoms TEXT,
  medical_history TEXT,
  consultation_type TEXT,
  payment_status TEXT,
  appointment_status TEXT,
  priority TEXT,
  doctor_notes TEXT,
  prescription TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setDepartment("");
                  setDoctorId("");
                  setDate("");
                  setTimeSlot("");
                  setSymptoms("");
                  setHistory("");
                  setBookingId("");
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold text-xs transition"
              >
                Book Another
              </button>
              <button
                onClick={() => onNavigateToTab?.("dashboard")}
                className="flex-1 bg-[#0F9D58] hover:bg-[#0B7D45] text-white py-3 rounded-xl font-bold text-xs transition shadow-md shadow-green-50"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
