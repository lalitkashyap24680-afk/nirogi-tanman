import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { saveAppointmentToSupabase } from "./supabase";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper for file-based database
function getDbFile(filename: string, defaultData: any) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    return defaultData;
  }
}

function saveDbFile(filename: string, data: any) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Simple hash for password
function hashPassword(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return "hash_" + Math.abs(hash).toString(16);
}

// SEED DATA INITIALIZATION
const initialUsers = [
  {
    id: "admin-1",
    email: "admin@nirogitanman.com",
    phone: "9999999999",
    password: hashPassword("admin123"),
    name: "Dr. Alok Verma",
    role: "admin",
    age: 48,
    gender: "Male",
    bloodGroup: "O+",
    address: "Healthcare Enclave, New Delhi",
    emergencyContact: "9999999998",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doctor-1",
    email: "doctor1@nirogitanman.com",
    phone: "9876543211",
    password: hashPassword("doctor123"),
    name: "Dr. Aditya Sharma",
    role: "doctor",
    specialization: "Cardiology",
    qualification: "MD (Integrative Cardiology), PG Diploma in Ayurvedic Cardiology",
    experience: "15 Years",
    languages: ["English", "Hindi"],
    consultationFee: 800,
    availableTime: "10:00 AM - 02:00 PM",
    rating: 4.9,
    biography: "Dr. Aditya Sharma bridges modern clinical cardiology and Vedic lifestyle therapy, prescribing organic cardio-protective herbs and yoga to lower blood pressure and reverse arterial plaque naturally.",
    certificates: ["Fellowship in Ayurvedic Cardiology", "Member of Cardiological Society of India"],
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doctor-2",
    email: "doctor2@nirogitanman.com",
    phone: "9876543212",
    password: hashPassword("doctor123"),
    name: "Dr. Priya Patel",
    role: "doctor",
    specialization: "General Medicine",
    qualification: "BAMS, MD (Ayurvedic Kayachikitsa)",
    experience: "10 Years",
    languages: ["English", "Hindi", "Gujarati"],
    consultationFee: 500,
    availableTime: "02:00 PM - 06:00 PM",
    rating: 4.8,
    biography: "Dr. Priya Patel is a certified Ayurvedic Physician with 10+ years of clinical practice. She specializes in Kayachikitsa (Internal Medicine) and custom herbal pharmacology to treat metabolic disorders and manage diabetes naturally.",
    certificates: ["Specialization in Ayurvedic Diabetology", "AHA Certified General Physician"],
    avatar: "/src/assets/images/dr_priya_patel_1783616739766.jpg"
  },
  {
    id: "doctor-3",
    email: "doctor3@nirogitanman.com",
    phone: "9876543213",
    password: hashPassword("doctor123"),
    name: "Dr. Vikram Malhotra",
    role: "doctor",
    specialization: "Psychiatry",
    qualification: "MD (Holistic Psychiatry), Certified Mindfulness Trainer",
    experience: "12 Years",
    languages: ["English", "Hindi", "Punjabi"],
    consultationFee: 1000,
    availableTime: "04:00 PM - 08:00 PM",
    rating: 4.7,
    biography: "Dr. Vikram Malhotra specializes in anxiety therapy, mental wellness, clinical depression counseling, and mindfulness-based cognitive therapy integrated with calming herbal adaptogens.",
    certificates: ["Indian Psychiatric Society Fellow", "Cognitive Behavioral Therapy Specialist"],
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doctor-4",
    email: "doctor4@nirogitanman.com",
    phone: "9876543214",
    password: hashPassword("doctor123"),
    name: "Dr. Sneha Reddy",
    role: "doctor",
    specialization: "Ayurveda & Yoga",
    qualification: "BAMS, MD (Ayurveda Panchakarma)",
    experience: "8 Years",
    languages: ["English", "Telugu", "Hindi"],
    consultationFee: 400,
    availableTime: "09:00 AM - 01:00 PM",
    rating: 4.9,
    biography: "Dr. Sneha combines traditional Vedic cleansing sciences (Panchakarma) with modern metabolic detox guidelines, offering deep physiological purification and systemic healing.",
    certificates: ["Panchakarma Expert Certification", "Advanced Yoga Trainer Diploma"],
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "patient-1",
    email: "rajlalit2026@gmail.com",
    phone: "9876543210",
    password: hashPassword("password123"),
    name: "Raj Lalit",
    role: "patient",
    age: 28,
    gender: "Male",
    bloodGroup: "B+",
    address: "Flat 402, Green Meadows, Sector 62, Noida",
    emergencyContact: "9876543219",
    height: "178 cm",
    weight: "72 kg",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
  }
];

const initialMedicines = [
  {
    id: "med-1",
    name: "Brahmi Brain Essence (Bacopa Monnieri)",
    brand: "Himalaya Organics",
    category: "Ayurveda & Brain Health",
    description: "A premium organic adaptogenic brain tonic clinically studied for enhancing memory, focus, cognitive processing speeds, and calming nervous stress levels.",
    price: 380,
    discount: 10,
    stock: 120,
    prescriptionRequired: false,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "med-2",
    name: "KSM-66 Organic Ashwagandha Extract",
    brand: "Organic India",
    category: "Stress & Sleep Support",
    description: "Pure, high-concentration adaptogenic Ashwagandha root extract. Works directly to lower physiological cortisol markers, alleviate exhaustion, and restore healthy circadian sleep cycles.",
    price: 450,
    discount: 15,
    stock: 80,
    prescriptionRequired: false,
    image: "/src/assets/images/ashwagandha_leaves_1783616727771.jpg"
  },
  {
    id: "med-3",
    name: "Amrit Tulsi & Giloy Immunity Shield",
    brand: "Vaidyaratnam",
    category: "Respiratory & Immunity",
    description: "A potent therapeutic infusion of Holy Basil (Tulsi) and heart-leaved Moonseed (Giloy). Fortifies respiratory immunity, fights seasonal viral stress, and purifies systemic blood.",
    price: 290,
    discount: 8,
    stock: 95,
    prescriptionRequired: false,
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "med-4",
    name: "Himalayan Shodhit Shilajit Resin",
    brand: "Kapiva Wellness",
    category: "Ojas & Systemic Energy",
    description: "Gold-grade purified organic Shilajit resin. Enriched with over 84+ mineral compounds and high fulvic acid content to enhance oxygenation, muscle recovery, and stamina.",
    price: 990,
    discount: 12,
    stock: 60,
    prescriptionRequired: false,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "med-5",
    name: "Triphala Organic Digestive Cleanse",
    brand: "Patanjali Ayurveda",
    category: "Digestive & Detox",
    description: "The classic Ayurvedic blend of Amalaki, Bibhitaki, and Haritaki fruit powders. Promotes natural colon detoxification, eases sluggish digestion, and balances internal Agni (digestive fire).",
    price: 190,
    discount: 5,
    stock: 150,
    prescriptionRequired: false,
    image: "https://images.unsplash.com/photo-1611070973770-b1a6cdb63298?auto=format&fit=crop&q=80&w=600"
  }
];

const initialBlogs = [
  {
    id: "blog-1",
    title: "10 Easy Ways to Improve Your Cardiovascular Health Today",
    category: "Heart Care",
    author: "Dr. Aditya Sharma",
    date: "2026-07-01",
    readTime: "5 mins",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600",
    content: "Heart disease remains the leading cause of death globally, yet up to 80% of cardiovascular complications can be avoided through simple daily adjustments. This article walks you through actionable exercise, sodium intake control, sleep cycles, and stress mitigation protocols that Dr. Sharma prescribes to his heart patients daily."
  },
  {
    id: "blog-2",
    title: "Vedic Lifestyle: Integrating Yoga and Ayurveda for Inner Peace",
    category: "Yoga",
    author: "Dr. Sneha Reddy",
    date: "2026-07-05",
    readTime: "7 mins",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
    content: "Ayurveda and Yoga are sister sciences. Ayurveda focuses on the health of the physical body (rebalancing your Doshas) while Yoga focuses on calming the mental chatter. Here we outline a 15-minute morning routine involving pranayama breathing, oil pulling, and sun salutations to reset your biological clock."
  },
  {
    id: "blog-3",
    title: "Demystifying Mental Burnout: When to See a Psychiatrist",
    category: "Mental Health",
    author: "Dr. Vikram Malhotra",
    date: "2026-07-08",
    readTime: "6 mins",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600",
    content: "With work-from-home blurring work-life boundaries, burnout has peaked. In this article, Dr. Vikram explains the subtle clinical differences between normal fatigue, mental burnout, and clinical anxiety. Read on to learn about cognitive reframing exercises and self-assessment indicators."
  }
];

const initialAppointments = [
  {
    id: "apt-101",
    patientId: "patient-1",
    patientName: "Raj Lalit",
    doctorId: "doctor-1",
    doctorName: "Dr. Aditya Sharma",
    department: "Cardiology",
    appointmentDate: "2026-07-10",
    appointmentTime: "10:30 AM",
    symptoms: "Minor chest tightness during heavy running exercise.",
    medicalHistory: "Grandfather had heart surgery. No prior personal issues.",
    consultationType: "Offline",
    paymentStatus: "Paid",
    appointmentStatus: "Confirmed",
    priority: "Normal",
    doctorNotes: "",
    prescription: "",
    createdBy: "patient-1",
    createdAt: "2026-07-08T10:00:00Z",
    updatedAt: "2026-07-08T10:00:00Z",
    timeline: [
      { status: "Pending", time: "2026-07-08T10:00:00Z", note: "Appointment requested by Patient." },
      { status: "Confirmed", time: "2026-07-08T12:30:00Z", note: "Appointment confirmed. Time slot 10:30 AM allocated." }
    ]
  },
  {
    id: "apt-102",
    patientId: "patient-1",
    patientName: "Raj Lalit",
    doctorId: "doctor-2",
    doctorName: "Dr. Priya Patel",
    department: "General Medicine",
    appointmentDate: "2026-07-09",
    appointmentTime: "02:30 PM",
    symptoms: "Seasonal dry cough and slight evening temperature.",
    medicalHistory: "None.",
    consultationType: "Online",
    paymentStatus: "Paid",
    appointmentStatus: "Completed",
    priority: "Normal",
    doctorNotes: "Common cold. Advised rest and warm water fluid intake.",
    prescription: "Tab Calpol 650mg - Twice a day after meals. Cough syrup - 10ml thrice a day.",
    createdBy: "patient-1",
    createdAt: "2026-07-09T08:00:00Z",
    updatedAt: "2026-07-09T08:45:00Z",
    timeline: [
      { status: "Pending", time: "2026-07-09T08:00:00Z", note: "Requested online consultation." },
      { status: "Confirmed", time: "2026-07-09T08:10:00Z", note: "Confirmed by system scheduler." },
      { status: "In Consultation", time: "2026-07-09T08:30:00Z", note: "Consultation started." },
      { status: "Prescription Generated", time: "2026-07-09T08:42:00Z", note: "Prescription written by Dr. Priya Patel." },
      { status: "Completed", time: "2026-07-09T08:45:00Z", note: "Consultation finished successfully." }
    ]
  }
];

// Load collections
const users = getDbFile("users.json", initialUsers);
const medicines = getDbFile("medicines.json", initialMedicines);
const blogs = getDbFile("blogs.json", initialBlogs);
const appointments = getDbFile("appointments.json", initialAppointments);
const orders = getDbFile("orders.json", []);
const sessions: { [token: string]: any } = {};

// Helper to save db state
function persistAll() {
  saveDbFile("users.json", users);
  saveDbFile("medicines.json", medicines);
  saveDbFile("blogs.json", blogs);
  saveDbFile("appointments.json", appointments);
  saveDbFile("orders.json", orders);
}

// Middleware to protect routes & check roles
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  const sessionUser = sessions[token];
  if (!sessionUser) {
    // Try to find if user token is valid
    const user = users.find((u: any) => u.id === token || `session_${u.id}` === token);
    if (user) {
      req.user = user;
      return next();
    }
    return res.status(403).json({ error: "Session expired or invalid." });
  }

  req.user = sessionUser;
  next();
}

// REST API ROUTES

// AUTHENTICATION APIs
app.get("/api/auth/profile", authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/simple-login", (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Full Name and Mobile Number are required." });
  }

  const cleanPhone = phone.trim();
  const cleanName = name.trim();

  // Find user by phone
  let user = users.find((u: any) => u.phone === cleanPhone);

  if (!user) {
    // Create simple user without password
    user = {
      id: `patient-${Date.now()}`,
      name: cleanName,
      email: `${cleanName.toLowerCase().replace(/\s+/g, "")}@nirogitanman.com`,
      phone: cleanPhone,
      password: "no_password",
      role: "patient",
      age: 28,
      gender: "Not Specified",
      bloodGroup: "O+",
      address: "",
      emergencyContact: "",
      height: "172 cm",
      weight: "70 kg",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`
    };
    users.push(user);
    persistAll();
  } else {
    // Update name if different
    if (user.name !== cleanName) {
      user.name = cleanName;
      persistAll();
    }
  }

  const token = `session_${user.id}`;
  sessions[token] = user;

  res.json({
    message: "Login successful!",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization,
      avatar: user.avatar,
      age: user.age,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      address: user.address,
      emergencyContact: user.emergencyContact,
      height: user.height,
      weight: user.weight
    }
  });
});

app.post("/api/auth/signup", (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and Mobile Number are required." });
  }

  const exists = users.find((u: any) => u.phone === phone);
  if (exists) {
    return res.status(400).json({ error: "User already registered with this mobile number." });
  }

  const newUser = {
    id: `patient-${Date.now()}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, "")}@nirogitanman.com`,
    phone,
    password: "no_password",
    role: "patient",
    age: 30,
    gender: "Not Specified",
    bloodGroup: "O+",
    address: "",
    emergencyContact: "",
    height: "170 cm",
    weight: "70 kg"
  };

  users.push(newUser);
  persistAll();

  // Create auto session
  const token = `session_${newUser.id}`;
  sessions[token] = newUser;

  res.status(201).json({
    message: "Registration successful!",
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, password } = req.body;
  // Fallback support for older clients, but we promote passwordless
  if (!emailOrPhone) {
    return res.status(400).json({ error: "Mobile number or Email is required." });
  }

  // Find user by phone or email
  const user = users.find(
    (u: any) =>
      u.phone === emailOrPhone || u.email.toLowerCase() === emailOrPhone.toLowerCase()
  );

  if (!user) {
    return res.status(400).json({ error: "No account found with this credential." });
  }

  const token = `session_${user.id}`;
  sessions[token] = user;

  res.json({
    message: "Login successful!",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization,
      avatar: user.avatar,
      age: user.age,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      address: user.address,
      emergencyContact: user.emergencyContact,
      height: user.height,
      weight: user.weight
    }
  });
});

// GET CURRENT LOGGED USER
app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// UPDATE PROFILE
app.put("/api/auth/profile", authenticateToken, (req: any, res) => {
  const userIndex = users.findIndex((u: any) => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const updatedData = { ...users[userIndex], ...req.body };
  // Protect critical properties
  updatedData.id = req.user.id;
  updatedData.role = req.user.role;
  updatedData.password = users[userIndex].password;

  users[userIndex] = updatedData;
  sessions[`session_${req.user.id}`] = updatedData;
  persistAll();

  res.json({ message: "Profile updated successfully!", user: updatedData });
});

// DOCTORS LIST
app.get("/api/doctors", (req, res) => {
  const docList = users.filter((u: any) => u.role === "doctor" || u.specialization);
  res.json({ doctors: docList });
});

// GET MEDICINES
app.get("/api/medicines", (req, res) => {
  res.json({ medicines });
});

// ADMIN MANAGE MEDICINE: ADD OR UPDATE
app.post("/api/medicines", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can manage medicine catalog." });
  }
  const { name, brand, category, description, price, discount, stock, prescriptionRequired, image } = req.body;
  const newMed = {
    id: `med-${Date.now()}`,
    name,
    brand,
    category,
    description,
    price: Number(price),
    discount: Number(discount || 0),
    stock: Number(stock || 10),
    prescriptionRequired: Boolean(prescriptionRequired),
    image: image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200"
  };
  medicines.push(newMed);
  persistAll();
  res.status(201).json({ message: "Medicine added to store successfully!", medicine: newMed });
});

app.put("/api/medicines/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can edit medicine catalog." });
  }
  const medIdx = medicines.findIndex((m: any) => m.id === req.params.id);
  if (medIdx === -1) return res.status(404).json({ error: "Medicine not found." });

  medicines[medIdx] = { ...medicines[medIdx], ...req.body };
  persistAll();
  res.json({ message: "Medicine updated successfully!", medicine: medicines[medIdx] });
});

app.delete("/api/medicines/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can delete medicine catalog." });
  }
  const medIdx = medicines.findIndex((m: any) => m.id === req.params.id);
  if (medIdx === -1) return res.status(404).json({ error: "Medicine not found." });

  medicines.splice(medIdx, 1);
  persistAll();
  res.json({ message: "Medicine deleted successfully!" });
});

// BLOGS
app.get("/api/blogs", (req, res) => {
  res.json({ blogs });
});

// PATIENTS (FOR ADMIN USE)
app.get("/api/patients", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin" && req.user.role !== "doctor") {
    return res.status(403).json({ error: "Access denied." });
  }
  const patients = users.filter((u: any) => u.role === "patient");
  res.json({ patients });
});

// APPOINTMENTS
app.get("/api/appointments", authenticateToken, (req: any, res) => {
  let userAppointments = appointments;
  if (req.user.role === "patient") {
    userAppointments = appointments.filter((a: any) => a.patientId === req.user.id);
  } else if (req.user.role === "doctor") {
    userAppointments = appointments.filter((a: any) => a.doctorId === req.user.id);
  }
  res.json({ appointments: userAppointments });
});

// BOOK APPOINTMENT
app.post("/api/appointments", authenticateToken, async (req: any, res) => {
  const {
    patientId,
    patientName,
    mobileNumber,
    emailAddress,
    age,
    gender,
    bloodGroup,
    address,
    doctorId,
    department,
    appointmentDate,
    appointmentTime,
    symptoms,
    medicalHistory,
    consultationType,
    priority,
    paymentStatus
  } = req.body;

  let targetPatientId = patientId;
  let targetPatientName = patientName;

  // Admin booking on behalf of patient, or new patient registration on the fly
  if (req.user.role === "admin" && !patientId) {
    // Check if user already exists
    let existingPatient = users.find(
      (u: any) =>
        (emailAddress && u.email.toLowerCase() === emailAddress.toLowerCase()) ||
        (mobileNumber && u.phone === mobileNumber)
    );

    if (!existingPatient) {
      // Register on the fly
      existingPatient = {
        id: `patient-${Date.now()}`,
        name: patientName,
        email: emailAddress ? emailAddress.toLowerCase() : `guest-${Date.now()}@nirogitanman.com`,
        phone: mobileNumber || "0000000000",
        password: hashPassword("guest123"),
        role: "patient",
        age: Number(age || 30),
        gender: gender || "Male",
        bloodGroup: bloodGroup || "O+",
        address: address || "",
        emergencyContact: "",
        height: "170 cm",
        weight: "70 kg"
      };
      users.push(existingPatient);
      persistAll();
    }
    targetPatientId = existingPatient.id;
    targetPatientName = existingPatient.name;
  } else if (!patientId) {
    targetPatientId = req.user.id;
    targetPatientName = req.user.name;
  }

  // Get Doctor info
  const doc = users.find((u: any) => u.id === doctorId);
  const doctorName = doc ? doc.name : "Assigned Practitioner";

  const newAppointment = {
    id: `apt-${Date.now().toString().slice(-6)}`,
    patientId: targetPatientId,
    patientName: targetPatientName,
    doctorId,
    doctorName,
    department,
    appointmentDate,
    appointmentTime,
    symptoms: symptoms || "",
    medicalHistory: medicalHistory || "",
    consultationType: consultationType || "Offline",
    paymentStatus: paymentStatus || "Unpaid",
    appointmentStatus: "Pending",
    priority: priority || "Normal",
    doctorNotes: "",
    prescription: "",
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        status: "Pending",
        time: new Date().toISOString(),
        note: `Appointment requested by ${req.user.role === "admin" ? "Administrator" : "Patient"}.`
      }
    ]
  };

  appointments.push(newAppointment);
  persistAll();

  // Async sync to Supabase database table
  const supabaseResult = await saveAppointmentToSupabase(newAppointment);
  if (!supabaseResult.success) {
    console.warn("Supabase integration warning:", supabaseResult.error);
  }

  res.status(201).json({
    message: "Appointment booked successfully!",
    appointment: newAppointment,
    supabaseSync: supabaseResult
  });
});

// UPDATE APPOINTMENT STATUS & TIMELINE
app.put("/api/appointments/:id/status", authenticateToken, (req: any, res) => {
  const { status, note, doctorNotes, prescription, paymentStatus } = req.body;
  const aptIdx = appointments.findIndex((a: any) => a.id === req.params.id);

  if (aptIdx === -1) {
    return res.status(404).json({ error: "Appointment not found." });
  }

  const apt = appointments[aptIdx];

  // Role validation
  if (req.user.role === "patient" && apt.patientId !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized access." });
  }
  if (req.user.role === "doctor" && apt.doctorId !== req.user.id) {
    return res.status(403).json({ error: "This consultation is not assigned to you." });
  }

  if (status) {
    apt.appointmentStatus = status;
    apt.timeline.push({
      status,
      time: new Date().toISOString(),
      note: note || `Consultation stage transition to ${status}.`
    });
  }

  if (doctorNotes !== undefined) apt.doctorNotes = doctorNotes;
  if (prescription !== undefined) apt.prescription = prescription;
  if (paymentStatus !== undefined) apt.paymentStatus = paymentStatus;

  apt.updatedAt = new Date().toISOString();
  appointments[aptIdx] = apt;
  persistAll();

  res.json({ message: "Appointment updated successfully!", appointment: apt });
});

// CANCEL APPOINTMENT
app.post("/api/appointments/:id/cancel", authenticateToken, (req: any, res) => {
  const aptIdx = appointments.findIndex((a: any) => a.id === req.params.id);
  if (aptIdx === -1) return res.status(404).json({ error: "Appointment not found." });

  const apt = appointments[aptIdx];
  if (req.user.role === "patient" && apt.patientId !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized." });
  }

  apt.appointmentStatus = "Cancelled";
  apt.timeline.push({
    status: "Cancelled",
    time: new Date().toISOString(),
    note: `Cancelled by ${req.user.role}.`
  });
  apt.updatedAt = new Date().toISOString();
  persistAll();

  res.json({ message: "Appointment cancelled successfully.", appointment: apt });
});

// ORDER MEDICINES
app.post("/api/orders", authenticateToken, (req: any, res) => {
  const { items, address, paymentMethod, couponCode, deliveryCharges, gst, grandTotal } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items in cart." });
  }

  const newOrder = {
    id: `ord-${Date.now().toString().slice(-6)}`,
    patientId: req.user.id,
    patientName: req.user.name,
    items,
    address,
    paymentMethod,
    couponCode: couponCode || "None",
    deliveryCharges: Number(deliveryCharges || 0),
    gst: Number(gst || 0),
    grandTotal: Number(grandTotal),
    status: "Placed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Adjust stock levels
  items.forEach((item: any) => {
    const med = medicines.find((m: any) => m.id === item.id);
    if (med) {
      med.stock = Math.max(0, med.stock - item.quantity);
    }
  });

  orders.push(newOrder);
  persistAll();

  res.status(201).json({
    message: "Order placed successfully!",
    order: newOrder
  });
});

app.get("/api/orders", authenticateToken, (req: any, res) => {
  let userOrders = orders;
  if (req.user.role === "patient") {
    userOrders = orders.filter((o: any) => o.patientId === req.user.id);
  }
  res.json({ orders: userOrders });
});

app.put("/api/orders/:id/status", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can change order status." });
  }
  const ordIdx = orders.findIndex((o: any) => o.id === req.params.id);
  if (ordIdx === -1) return res.status(404).json({ error: "Order not found." });

  orders[ordIdx].status = req.body.status;
  orders[ordIdx].updatedAt = new Date().toISOString();
  persistAll();

  res.json({ message: "Order status updated!", order: orders[ordIdx] });
});

// AI CHAT WIDGET ROUTE (using @google/genai)
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Prompt message is empty." });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: "Hi! I am the Nirogi-TanMan AI health assistant. Please configure your GEMINI_API_KEY in the Secrets panel so that I can provide intelligent replies! In the meantime, I can advise you that drinking enough water, meditating daily, and scheduling an appointment with Dr. Priya Patel is a great way to stay healthy!"
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const formattedHistory = (chatHistory || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { text: message }
      ],
      config: {
        systemInstruction: "You are the friendly, intelligent AI Health Assistant for Nirogi-TanMan, a premium wellness and healthcare startup. Your primary role is to answer basic health queries politely, guide them on healthy lifestyles, suggest wellness goals, recommend scheduling appointments with our doctors (Dr. Aditya Sharma - Cardiologist, Dr. Priya Patel - General Physician, Dr. Vikram Malhotra - Psychiatrist, Dr. Sneha Reddy - Yoga/Ayurveda), and search medicines (Paracetamol, Ashwagandha, Multivitamins). Keep replies concise, helpful, and include professional disclaimers that they must consult doctors for urgent symptoms."
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI model. Please check connection." });
  }
});

// Serve assets statically
app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));

// VITE ENGINE SETUP (BRIDGE MIDDLEWARE)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
