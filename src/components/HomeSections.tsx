import React, { useState } from "react";
import {
  Sprout,
  Heart,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Clock,
  User,
  Check,
  Award,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Star,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, Medicine } from "../types";

interface HomeSectionsProps {
  doctors: UserType[];
  medicines: Medicine[];
  onNavigateToTab: (tab: string) => void;
  onBookDoctor: (docId: string, dept: string) => void;
}

export default function HomeSections({
  doctors,
  medicines,
  onNavigateToTab,
  onBookDoctor
}: HomeSectionsProps) {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Newsletter subscription simulation
  const [subscribed, setSubscribed] = useState(false);
  const [newsEmail, setNewsEmail] = useState("");

  // Dinacharya clock selected routine
  const [selectedRoutine, setSelectedRoutine] = useState<number>(0);

  const handleNewsSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setNewsEmail("");
      }, 4000);
    }
  };

  const faqData = [
    {
      q: "What is Ayurvedic Medicine, and is it scientifically validated?",
      a: "Ayurveda is a 5,000-year-old system of holistic natural healing originating in India. Today, global clinical trials validate that its core principles—such as anti-inflammatory herbs like Ashwagandha and gut-cleansing dietary routines—significantly reduce chronic cardiovascular inflammation, manage cortisol levels, and support sustainable weight balance."
    },
    {
      q: "How does Nirogi-TanMan combine Ayurveda with modern medicine?",
      a: "We practice Integrative Health. Our panel includes modern medical doctors (such as cardiologists and psychiatrists) who collaborate directly with Ayurvedic practitioners. This guarantees that your treatment plan is grounded in scientific medical diagnostics while leveraging natural herbs and Yoga therapy to cure the root cause without side effects."
    },
    {
      q: "Are the medicines in the Pharmacy store certified organic?",
      a: "Yes! Every single product and formulation distributed through the Nirogi-TanMan store holds strict AYUSH and ISO 9001 certifications. They are processed in sterile, temperature-regulated clinical environments to ensure maximum herbal purity and bioactive potency."
    },
    {
      q: "How do I identify my Ayurvedic Body Type (Dosha)?",
      a: "Your primary bio-elements (Vata, Pitta, or Kapha) define your constitution or Prakriti. During your consultation, our doctors analyze your physical biomarkers, tongue profile, digestive strength, and lifestyle habits to determine your Dosha composition and customize your healing journey."
    }
  ];

  const dinacharyaRoutines = [
    {
      time: "5:00 AM - 6:00 AM",
      title: "Brahma Muhurta (Rise & Cleanse)",
      desc: "Awaken during the cosmic hours of peace. Drink warm water, cleanse sensory organs, and practice copper-cup water hydration to stimulate digestion and flush nocturnal impurities.",
      focus: "Purity & Awakening"
    },
    {
      time: "6:00 AM - 7:30 AM",
      title: "Sadhana (Pranayama & Yoga)",
      desc: "Practice gentle solar stretches (Surya Namaskar) followed by pranayama breathing loops. This balances brain hemispheres, oxygenates cells, and fortifies muscle core stability before solar heat peaks.",
      focus: "Oxygenation & Stretches"
    },
    {
      time: "12:00 PM - 1:30 PM",
      title: "Ahara (The Principal Meal)",
      desc: "Consume your heaviest, most nutritive meal now. When the sun is at its highest, your internal digestive fire (Agni) is most powerful. Focus entirely on organic, freshly cooked vegetables and whole grains.",
      focus: "Agni Optimization"
    },
    {
      time: "9:30 PM - 10:00 PM",
      title: "Nidra (Restorative Slumber)",
      desc: "Massage soles with organic sesame oil and disconnect from screens. Slip into absolute deep, healing rest during Kapha phase to allow hormones, memory, and cardiac cells to fully rebuild.",
      focus: "Cellular Recovery"
    }
  ];

  const successStories = [
    {
      name: "Meenakshi Deshmukh",
      condition: "Chronic Stress & Insomnia",
      quote: "My sleep pattern was completely broken. Dr. Sneha suggested a routine of Ashwagandha powder, soothing Pranayama before bed, and Vata-balancing diet guidelines. I slept like a child within two weeks without any sleeping aids!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Rameshwar Rao",
      condition: "Severe Acidity & IBS",
      quote: "I suffered from IBS and continuous gastric burning. Through integrative consulting, I started a tailored Panchakarma detox program combined with Patanjali Churna. My digestion has completely stabilized. Truly blessed!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Dr. Sandeep Chawla",
      condition: "Hypertension (High BP)",
      quote: "As a doctor myself, I was skeptical. But Dr. Aditya's natural cardio diet guidelines paired with gentle Hridaya yoga therapy lowered my systolic pressure by 15 points. Nirogi-TanMan's scientific organic approach is the future.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
    }
  ];

  const wellnessPrograms = [
    {
      title: "Rasayana Immune Shield",
      duration: "21 Days Program",
      desc: "Reinforce whole-body immune defenses and cellular vitality. Includes deep Prakriti profiling, organic herbal supplements supply, and weekly private yoga adjustments.",
      badge: "Best Seller"
    },
    {
      title: "Vata-Pitta De-Stress Sanctuary",
      duration: "14 Days Program",
      desc: "Soothe accumulated nervous system exhaustion, treat mental burnout, and cure insomnia. Features private mindfulness coaching, breathing therapies, and herbal teas delivery.",
      badge: "Highly Rated"
    },
    {
      title: "Metabolic Agni Balance",
      duration: "30 Days Program",
      desc: "Reset your liver functions, balance high cholesterol, and control Type-2 diabetes markers naturally. Involves standard blood vitals screening paired with custom Ayurvedic diet curation.",
      badge: "Clinical Focus"
    }
  ];

  return (
    <div className="space-y-24">
      {/* SECTION 1: WHY AYURVEDA */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-[#FFF8E7] rounded-[40px] -rotate-1 transform scale-102 blur-md"></div>
          <img
            src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600"
            alt="Organic herbs and mortars"
            className="rounded-[32px] shadow-xl border-4 border-white object-cover relative z-10 w-full h-[380px]"
          />
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-green-100 z-20 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center">
              <Sprout size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">100% Organic Herbs</p>
              <p className="text-[10px] text-slate-500">AYUSH & ISO Certified Quality</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Root Cause Healing</span>
            <h3 className="text-3xl font-serif font-bold text-slate-800 dark:text-white leading-tight">
              Why Ayurveda and Natural Medicine?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
              Unlike quick synthetic remedies that mask biological symptoms, Ayurveda treats the body as an interconnected sanctuary. It targets the roots of physiological and emotional blockages to restore permanent healing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#2E7D32] flex items-center justify-center shrink-0 border border-green-100/30">
                <Check size={18} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white">Prevention over Cure</h4>
                <p className="text-slate-400 text-xs mt-0.5">Fortify bodily immune defenses long before metabolic disease markers can manifest.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#2E7D32] flex items-center justify-center shrink-0 border border-green-100/30">
                <Check size={18} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white">Zero Synthetic Side Effects</h4>
                <p className="text-slate-400 text-xs mt-0.5">Remedies made of organic botanical extracts that synergize with your liver and gut cells seamlessly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#2E7D32] flex items-center justify-center shrink-0 border border-green-100/30">
                <Check size={18} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white">Complete Mind-Body Equilibrium</h4>
                <p className="text-slate-400 text-xs mt-0.5">Tailored pranayama and diet balancing to elevate both spiritual clarity and cellular vigor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HEALING PROCESS */}
      <section className="bg-cream/40 dark:bg-slate-900/60 p-8 md:p-12 rounded-[40px] border border-green-100/30 dark:border-slate-800 space-y-12">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Our Sacred Methodology</span>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white">Our 4-Stage Pathway to Pristine Health</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            We follow a structured integrative scientific approach to guide your physical rehabilitation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: "01",
              title: "Clinical Consultation",
              desc: "Undergo virtual video evaluation with certified modern medical clinicians and Ayurvedic specialists."
            },
            {
              step: "02",
              title: "Prakriti Assessment",
              desc: "Determine your biological Dosha (Vata, Pitta, Kapha) profile and identify metabolic toxins accumulation."
            },
            {
              step: "03",
              title: "Botanical Prescription",
              desc: "Receive customized, premium AYUSH-certified herbal medications dispatched directly to your doorstep."
            },
            {
              step: "04",
              title: "Dinacharya Alignment",
              desc: "Sustain health permanently through physical yoga routines, bio-clock alignment, and organic diets."
            }
          ].map((proc, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-green-50/50 dark:border-slate-850 relative space-y-4 shadow-sm">
              <span className="text-4xl font-serif font-black text-green-100 dark:text-slate-700 block">{proc.step}</span>
              <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white leading-snug">{proc.title}</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">{proc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: MEET OUR EXPERTS */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Healing Practitioners</span>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-white">Meet Our Certified Specialists</h3>
            <p className="text-slate-400 text-xs">Directly access consultation calendars and read clinical biographies.</p>
          </div>
          <button
            onClick={() => onNavigateToTab("doctors")}
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-green-100 shadow-sm transition"
          >
            View All Doctors <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.slice(0, 4).map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-green-50/30 dark:border-slate-750 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-44 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-emerald-50 text-[#2E7D32] dark:bg-green-950/40 dark:text-green-200 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md shadow-sm border border-green-100">
                    {doc.specialization}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{doc.qualification}</span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold"><Star size={10} className="fill-current" /> {doc.rating}</span>
                  </div>
                  <h4 className="font-serif font-bold text-slate-800 dark:text-white text-sm">{doc.name}</h4>
                  <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed">{doc.biography}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-[#2E7D32] font-semibold">₹ {doc.consultationFee} slot</span>
                <button
                  onClick={() => onBookDoctor(doc.id, doc.specialization || "General Medicine")}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: HERBAL PRODUCTS FEATURED */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Premium Botanicals</span>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-white">Featured Organic Remedies</h3>
            <p className="text-slate-400 text-xs">Standard ISO certified ayurvedic formulas processed in sterile laboratiories.</p>
          </div>
          <button
            onClick={() => onNavigateToTab("store")}
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-green-100 shadow-sm transition"
          >
            Enter Pharmacy Shop <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {medicines.slice(0, 4).map((med) => (
            <div
              key={med.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-green-50/20 dark:border-slate-750 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="h-40 bg-[#FCFBF7] dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative">
                  <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-emerald-50 text-[#2E7D32] text-[8px] font-extrabold px-2 py-0.5 rounded shadow-sm border border-green-100">
                    {med.brand}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <h5 className="font-serif font-bold text-slate-800 dark:text-white line-clamp-1">{med.name}</h5>
                  <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed">{med.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">₹ {Math.round(med.price * (1 - med.discount / 100))}</span>
                  {med.discount > 0 && <span className="text-[10px] text-slate-400 line-through block">₹ {med.price}</span>}
                </div>
                <button
                  onClick={() => onNavigateToTab("store")}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: WELLNESS PROGRAMS */}
      <section className="space-y-10">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Signature Therapy</span>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-white">Holistic Wellness Packages</h3>
          <p className="text-slate-400 text-xs">Curated multiple-week therapeutic tracks targeting common corporate wellness limitations.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {wellnessPrograms.map((prog, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-green-100/20 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] bg-green-50 dark:bg-green-950/40 text-[#2E7D32] font-extrabold px-2.5 py-0.5 rounded-md border border-green-100">
                    {prog.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{prog.duration}</span>
                </div>
                <h4 className="text-base font-serif font-bold text-slate-800 dark:text-white leading-snug">{prog.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{prog.desc}</p>
              </div>

              <button
                onClick={() => onNavigateToTab("appointment")}
                className="w-full bg-cream hover:bg-beige text-[#2E7D32] dark:bg-slate-900 dark:hover:bg-slate-750 dark:text-green-300 py-3 rounded-xl font-bold text-xs transition text-center"
              >
                Inquire Program Curation
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: DINACHARYA BIOCLOCK TIPS */}
      <section className="grid md:grid-cols-2 gap-12 items-center bg-[#FCFBF7] dark:bg-slate-900 p-8 md:p-12 rounded-[40px] border border-green-100/20">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Natural Rhythms</span>
            <h3 className="text-3xl font-serif font-bold text-slate-800 dark:text-white leading-tight">
              Apothecary Dinacharya Daily Routine
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Dinacharya is the ancient practice of syncing daily activities with the biological clocks of solar energy and Doshas to trigger deep self-healing.
            </p>
          </div>

          <div className="space-y-3">
            {dinacharyaRoutines.map((routine, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRoutine(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition flex justify-between items-center gap-4 ${
                  selectedRoutine === idx
                    ? "bg-white dark:bg-slate-800 border-[#2E7D32] shadow-md"
                    : "bg-white/50 dark:bg-slate-800/40 border-slate-100 hover:bg-white"
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-[#2E7D32] uppercase">{routine.time}</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white font-serif">{routine.title}</h4>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 shrink-0 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">
                  {routine.focus}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-green-50/40 shadow-xl space-y-6">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-[#2E7D32]">
            <Clock size={24} />
          </div>
          <div className="space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Active Phase Insights</span>
            <h4 className="text-lg font-serif font-bold text-slate-800 dark:text-white leading-snug">
              {dinacharyaRoutines[selectedRoutine].title}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
              {dinacharyaRoutines[selectedRoutine].desc}
            </p>
          </div>
          <div className="bg-[#FCFBF7] dark:bg-slate-900 p-4 rounded-xl border flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#2E7D32] flex items-center gap-1">
              <Sparkles size={12} /> Dosha Influence: Pitta & Vata balancing
            </span>
            <button onClick={() => onNavigateToTab("blogs")} className="font-bold text-slate-500 hover:underline">Read Blog →</button>
          </div>
        </div>
      </section>

      {/* SECTION 7: YOGA & MEDITATION BREATHING */}
      <section className="bg-gradient-to-tr from-[#2E7D32] to-[#4CAF50] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div className="space-y-6">
            <span className="text-[10px] bg-white/10 text-emerald-100 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 inline-block">
              Daily Healing Ritual
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
              Restore Inner Clarity with Pranayama Breathing
            </h3>
            <p className="text-emerald-100 text-xs md:text-sm leading-relaxed max-w-md">
              Pranayama expands cosmic lung oxygenation, activates the parasympathetic nerve pathways, and reduces stress hormone cortisol by 40% in just 10 minutes.
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex gap-3 items-center"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">✓</span> <span>Nadi Shodhana: Purify vital energy pathways</span></div>
              <div className="flex gap-3 items-center"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">✓</span> <span>Kapalbhati: Fuel Agni digestion heat</span></div>
              <div className="flex gap-3 items-center"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">✓</span> <span>Soham Dhyana: Quiet clinical anxiety stress</span></div>
            </div>
            <button
              onClick={() => onNavigateToTab("blogs")}
              className="bg-white text-[#2E7D32] hover:bg-emerald-50 px-6 py-3 rounded-xl text-xs font-bold transition duration-150"
            >
              Watch Video Tutorials
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 text-center text-xs">
            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">Stress Counter Benchmark</span>
            {/* Visual animated ring */}
            <div className="w-28 h-28 rounded-full border-4 border-white/20 border-t-white animate-spin flex items-center justify-center mx-auto" style={{ animationDuration: '4s' }}>
              <div className="text-white font-serif font-black text-lg animate-pulse">Soham</div>
            </div>
            <p className="text-[11px] text-emerald-100 italic leading-relaxed max-w-xs mx-auto">
              "Inhale deep peace for 4 seconds, hold cellular vitality for 4 seconds, exhale toxicity for 4 seconds."
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: PATIENT SUCCESS TESTIMONIALS */}
      <section className="space-y-10">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Success Testimonials</span>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-white">Stories of Holistic Rebirth</h3>
          <p className="text-slate-400 text-xs">Read genuine feedback from patients who healed chronic ailments through natural wellness.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {successStories.map((story, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-green-50/25 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
              <p className="text-slate-500 dark:text-slate-300 text-xs italic leading-relaxed">
                "{story.quote}"
              </p>
              <div className="flex gap-3 items-center border-t border-slate-50 dark:border-slate-700/60 pt-4">
                <img src={story.avatar} alt={story.name} className="w-10 h-10 rounded-full object-cover border-2 border-green-100" />
                <div>
                  <h5 className="font-serif font-bold text-xs text-slate-800 dark:text-white">{story.name}</h5>
                  <span className="text-[9px] font-bold text-[#2E7D32] bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded uppercase mt-0.5 inline-block">{story.condition}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: FAQs SECTION */}
      <section className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Common Inquiries</span>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-white">Frequently Asked Questions</h3>
          <p className="text-slate-400 text-xs">Clear answers regarding medical integration, safety certifications, and consultation guidelines.</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => {
            const isOpened = openFaq === index;
            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl border border-green-100/10 shadow-sm overflow-hidden text-xs">
                <button
                  onClick={() => setOpenFaq(isOpened ? null : index)}
                  className="w-full text-left p-5 font-bold text-slate-800 dark:text-white flex justify-between items-center"
                >
                  <span className="font-serif text-sm">{faq.q}</span>
                  <ChevronDown size={16} className={`text-[#2E7D32] transition duration-200 ${isOpened ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpened && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-50 dark:border-slate-700/60"
                    >
                      <p className="p-5 text-slate-500 dark:text-slate-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 10: NEWSLETTER BLOCK */}
      <section className="bg-cream p-8 md:p-12 rounded-[40px] border border-green-100 text-center max-w-4xl mx-auto space-y-6">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#2E7D32] mx-auto shadow-sm">
          <Mail size={24} />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-2xl font-serif font-bold text-slate-800">Subscribe to Herbal Wisdom</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Join 12,000+ wellness advocates. Receive bi-weekly Ayurvedic recipes, Pranayama tips, and early clinical program invitations.
          </p>
        </div>

        {subscribed ? (
          <div className="text-green-700 font-bold text-xs bg-white py-3 rounded-xl max-w-xs mx-auto shadow-sm">
            🌿 Vows Signed! Check your inbox soon.
          </div>
        ) : (
          <form onSubmit={handleNewsSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Your healing email address..."
              value={newsEmail}
              onChange={(e) => setNewsEmail(e.target.value)}
              className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
            />
            <button type="submit" className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-3 rounded-xl text-xs font-bold transition">
              Sign Up
            </button>
          </form>
        )}
      </section>

      {/* SECTION 11: CONTACT & CLINICAL LOCATION COORDINATES */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest block">Sanctuary Coordinates</span>
            <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white leading-tight">
              Visit Our Pristine Clinic
            </h3>
            <p className="text-slate-400 text-xs">
              Experience therapeutic Panchakarma massages and face-to-face physician assessments in our physical sanctuary.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <MapPin className="text-[#2E7D32] shrink-0" size={18} />
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Physical Address</p>
                <p className="text-slate-400">Metro Pillar 402, Green Meadows Lane, Noida Sector 62</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="text-[#2E7D32] shrink-0" size={18} />
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Phone Helpline</p>
                <p className="text-slate-400">+91 98765 43210 (Mon - Fri, 9:00 AM - 6:00 PM)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="text-[#2E7D32] shrink-0" size={18} />
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Email Sanctuary</p>
                <p className="text-slate-400">wellness@nirogitanman.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mock Map Element with warm green gradients */}
        <div className="bg-[#FFF8E7] rounded-[32px] p-6 border border-green-100 flex flex-col justify-between h-[300px] shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {/* Minimal line grids imitating streets */}
            <div className="absolute top-1/3 left-0 w-full h-[2px] bg-[#2E7D32]"></div>
            <div className="absolute top-2/3 left-0 w-full h-[2px] bg-[#2E7D32]"></div>
            <div className="absolute top-0 left-1/4 w-[2px] h-full bg-[#2E7D32]"></div>
            <div className="absolute top-0 left-3/4 w-[2px] h-full bg-[#2E7D32]"></div>
          </div>

          <div className="space-y-2 relative z-10">
            <span className="text-[9px] bg-white text-[#2E7D32] font-extrabold px-2.5 py-0.5 rounded border">Noida Sanctuary</span>
            <h4 className="font-serif font-bold text-slate-800 text-sm">Clinical Headquarters</h4>
            <p className="text-slate-500 text-[11px]">Latitude 28.6273° N, Longitude 77.3725° E</p>
          </div>

          <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm relative z-10 text-[11px]">
            <div>
              <span className="font-bold text-slate-800 block">Open: Mon-Sat</span>
              <span className="text-slate-500">9:00 AM - 8:00 PM</span>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="bg-[#2E7D32] text-white px-3.5 py-1.5 rounded-lg font-bold"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
