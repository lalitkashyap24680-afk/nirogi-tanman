import { useState, useEffect } from "react";
import { Star, Clock, Award, Languages, Search, Calendar, Sparkles, HeartHandshake, User, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType } from "../types";

interface DoctorsViewProps {
  doctors: UserType[];
  onBookWithDoctor: (docId: string, dept: string) => void;
  initialSearchTerm?: string;
}

// Map of clinical treatment details for organic Ayurvedic integration
const doctorAuraDetails: Record<string, { treatments: string[]; diseases: string[]; tags: string[] }> = {
  "doctor-1": {
    treatments: ["Ayurvedic Cardio-Protection", "Vascular Health", "Arterial Cleansing (Hridaya)"],
    diseases: ["Hypertension", "High Cholesterol", "Heart Blockages", "Chest Tightness"],
    tags: ["CardioCare", "HeartDiet", "OrganicHypertension", "Prevention"]
  },
  "doctor-2": {
    treatments: ["Prakriti-Based Diet Plans", "Immune Defense Booster", "Panchakarma Detox"],
    diseases: ["Diabetes Management", "Seasonal Cough", "Thyroid Imbalance", "Fatigue"],
    tags: ["FamilyCare", "Immunity", "MetabolicBalance", "Diabetes"]
  },
  "doctor-3": {
    treatments: ["Mindfulness Therapy (Dhyana)", "Restorative Yoga", "Sattva Psychology"],
    diseases: ["Clinical Depression", "Anxiety", "Chronic Insomnia", "Mental Burnout"],
    tags: ["MentalWellness", "StressRelief", "Mindfulness", "CBT"]
  },
  "doctor-4": {
    treatments: ["Panchakarma Purifying Rituals", "Herbomineral Restoratives", "Asana Posture Alignment"],
    diseases: ["Digestive Disorders", "Joint Pain", "Arthritis", "Toxin Accumulation (Ama)"],
    tags: ["DoshaBalancing", "Detoxification", "AyurvedicMD", "YogaTherapy"]
  }
};

export default function DoctorsView({ doctors, onBookWithDoctor, initialSearchTerm = "" }: DoctorsViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const specialties = ["All", "Ayurveda & Yoga", "General Medicine", "Cardiology", "Psychiatry"];

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

  // Check if doctor matches the search query in Name, Specialty, biography, qualification, diseases, treatments, tags
  const matchesSearch = (doc: UserType, term: string) => {
    if (!term.trim()) return true;
    const q = term.toLowerCase();
    const docData = doctorAuraDetails[doc.id] || { treatments: [], diseases: [], tags: [] };

    return (
      doc.name.toLowerCase().includes(q) ||
      (doc.specialization || "").toLowerCase().includes(q) ||
      (doc.qualification || "").toLowerCase().includes(q) ||
      (doc.biography || "").toLowerCase().includes(q) ||
      (doc.languages || []).some((l) => l.toLowerCase().includes(q)) ||
      docData.treatments.some((t) => t.toLowerCase().includes(q)) ||
      docData.diseases.some((d) => d.toLowerCase().includes(q)) ||
      docData.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory = specialtyFilter === "All" || doc.specialization === specialtyFilter;
    const matchesSearchText = matchesSearch(doc, searchTerm);
    return matchesCategory && matchesSearchText;
  });

  const mockReviews = [
    { name: "Suresh Patel", rating: 5, date: "2026-06-20", text: "Extremely detailed explanation of my Doshas. Highly empathetic listening." },
    { name: "Ananya Iyer", rating: 5, date: "2026-06-15", text: "Amazing healing approach. The lifestyle adjustments and herbal formulation completely resolved my gastric issues." },
    { name: "Rajat Mehra", rating: 4, date: "2026-06-10", text: "Very professional consultation. The yoga regimen and diet guidelines have brought down my blood pressure." }
  ];

  return (
    <div className="space-y-8">
      {/* Search Bar & Specialty Tabs */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-green-100/40 dark:border-slate-700/60 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Doctor Name, Treatment, Disease (e.g. Hypertension, Anxiety)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FCFBF7] dark:bg-slate-900 text-sm border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#2E7D32] focus:outline-none shadow-inner"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  setSpecialtyFilter(spec);
                  setSelectedDoctor(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 duration-100 ${
                  specialtyFilter === spec
                    ? "bg-[#2E7D32] text-white shadow-md shadow-green-100 dark:shadow-none"
                    : "bg-[#FCFBF7] dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedDoctor ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#FCFBF7] dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-green-100/50 dark:border-slate-700/50 max-w-4xl mx-auto space-y-8"
          >
            {/* Header / Bio */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={selectedDoctor.avatar}
                alt={selectedDoctor.name}
                className="w-32 h-32 rounded-3xl object-cover border-2 border-forest/30 dark:border-slate-700 shadow-md shrink-0"
              />
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 dark:bg-green-950/30 text-[#2E7D32] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-green-100">
                    {selectedDoctor.specialization}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                    <Star size={14} className="fill-current" /> {selectedDoctor.rating}
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white">{selectedDoctor.name}</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedDoctor.qualification}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Practice Span</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedDoctor.experience}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Languages Speak</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedDoctor.languages?.join(", ")}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 col-span-2 md:col-span-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Wellness Fee</span>
                    <span className="text-xs font-bold text-[#2E7D32]">₹ {selectedDoctor.consultationFee}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ayurvedic Integrations, Specializations & Availability */}
            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-700">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <Award size={16} className="text-[#2E7D32]" /> Holistic Mind-Body Biography
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {selectedDoctor.biography}
                  </p>
                </div>

                {/* Dynamic search highlights on diseases/treatments */}
                <div className="space-y-3">
                  <h5 className="font-serif font-semibold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Natural Focus & Treatable Diseases</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">CHRONIC CONDITIONS TREATS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(doctorAuraDetails[selectedDoctor.id]?.diseases || []).map((d) => (
                          <span key={d} className="text-[10px] bg-red-50/50 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-300 px-2.5 py-0.5 rounded-lg">
                            {highlightText(d, searchTerm)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">YOGA & NATURAL TREATMENTS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(doctorAuraDetails[selectedDoctor.id]?.treatments || []).map((t) => (
                          <span key={t} className="text-[10px] bg-green-50/80 text-green-700 border border-green-100 dark:bg-green-950/20 dark:text-green-300 px-2.5 py-0.5 rounded-lg">
                            {highlightText(t, searchTerm)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <Clock size={16} className="text-[#2E7D32]" /> Sanctuary Timings
                </h4>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-green-100/30 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Days Active</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Monday - Friday</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Hours</span>
                    <span className="font-bold text-[#2E7D32]">{selectedDoctor.availableTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-3">
                    * Standard wellness checks are highly prioritized. Booking guarantees immediate diagnostic assessment.
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="flex-1 bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold text-xs border border-slate-200 transition"
                  >
                    Back to Grid
                  </button>
                  <button
                    onClick={() => onBookWithDoctor(selectedDoctor.id, selectedDoctor.specialization || "General Medicine")}
                    className="flex-[2] bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-bold text-xs transition shadow-lg active:scale-95 duration-100"
                  >
                    Secure Booking Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Feedback reviews */}
            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1">
                <HeartHandshake size={16} className="text-[#2E7D32]" /> Patient Healing Testimonials ({mockReviews.length})
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {mockReviews.map((rev, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{rev.name}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-[#D4AF37]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={11} className="fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {filteredDoctors.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => {
                  const docData = doctorAuraDetails[doc.id] || { treatments: [], diseases: [], tags: [] };
                  return (
                    <motion.div
                      key={doc.id}
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl border border-green-100/30 dark:border-slate-700/50 flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      <div className="flex gap-4">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-700 shadow-inner shrink-0"
                        />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-emerald-50 dark:bg-green-950/40 text-[#2E7D32] text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border border-green-100/30">
                              {highlightText(doc.specialization || "", searchTerm)}
                            </span>
                            <span className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                              <Star size={11} className="fill-current" /> {doc.rating}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white hover:text-[#2E7D32] transition">
                            {highlightText(doc.name, searchTerm)}
                          </h4>
                          <p className="text-[10px] text-slate-400">{highlightText(doc.qualification || "", searchTerm)}</p>
                          <p className="text-[11px] text-[#2E7D32] font-semibold flex items-center"><DollarSign size={12} /> {doc.consultationFee} consultation</p>
                        </div>
                      </div>

                      {/* Display matched diseases and treatments dynamically */}
                      <div className="text-[11px] space-y-2 border-t border-slate-50 dark:border-slate-750 pt-3">
                        <div className="flex justify-between text-slate-500">
                          <span>Practice:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.experience}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Available hours:</span>
                          <span className="font-semibold text-[#2E7D32] truncate max-w-[140px]">{doc.availableTime}</span>
                        </div>
                        
                        {/* Highlight matched tags */}
                        {searchTerm.trim() !== "" && (
                          <div className="pt-1.5 space-y-1">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase">MATCHING ATTRIBUTES:</span>
                            <div className="flex flex-wrap gap-1">
                              {docData.diseases.concat(docData.treatments).filter(x => x.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3).map((item) => (
                                <span key={item} className="text-[9px] bg-green-50 text-[#2E7D32] px-1.5 py-0.5 rounded border border-green-100">
                                  {highlightText(item, searchTerm)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-slate-50 dark:border-slate-750 pt-3">
                        <button
                          onClick={() => setSelectedDoctor(doc)}
                          className="flex-1 bg-[#FCFBF7] hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs border border-slate-200/60 transition"
                        >
                          Core Profile
                        </button>
                        <button
                          onClick={() => onBookWithDoctor(doc.id, doc.specialization || "General Medicine")}
                          className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-2.5 rounded-xl font-bold text-xs transition shadow-sm active:scale-95 duration-100"
                        >
                          Consult
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
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">
                  🍂
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-slate-800 dark:text-white">No Healing Practitioners Found</h4>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                    No doctor profile matches your query "<span className="font-bold text-[#2E7D32]">{searchTerm}</span>". Please adjust your search keyword to view other specialists.
                  </p>
                </div>
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs px-4 py-2 rounded-xl font-semibold"
                >
                  Clear Search Filter
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
