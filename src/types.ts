export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: "patient" | "doctor" | "admin";
  specialization?: string;
  qualification?: string;
  experience?: string;
  languages?: string[];
  consultationFee?: number;
  availableTime?: string;
  rating?: number;
  biography?: string;
  certificates?: string[];
  avatar?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  height?: string;
  weight?: string;
}

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  prescriptionRequired: boolean;
  image: string;
}

export interface TimelineEvent {
  status: string;
  time: string;
  note: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
  medicalHistory: string;
  consultationType: "Offline" | "Online";
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  appointmentStatus:
    | "Pending"
    | "Confirmed"
    | "Checked In"
    | "Doctor Assigned"
    | "In Consultation"
    | "Prescription Generated"
    | "Completed"
    | "Cancelled"
    | "Rescheduled"
    | "No Show";
  priority: "Normal" | "Urgent" | "Emergency";
  doctorNotes: string;
  prescription: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface OrderItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  items: OrderItem[];
  address: string;
  paymentMethod: string;
  couponCode: string;
  deliveryCharges: number;
  gst: number;
  grandTotal: number;
  status: "Placed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}
