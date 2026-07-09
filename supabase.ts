import { createClient } from "@supabase/supabase-js";

let supabaseInstance: any = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL || "https://zxbtotedsyntcyifkumw.supabase.co";
    const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_qaWNRd6k3ZYF_cXY9r10Og_CUzQdcXl";

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase URL or Key is missing. Please define SUPABASE_URL and SUPABASE_KEY in your environment.");
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase Client initialized successfully with URL:", supabaseUrl);
  }
  return supabaseInstance;
}

export async function saveAppointmentToSupabase(appointment: any) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized." };
  }

  const camelCasePayload = {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    doctorId: appointment.doctorId,
    doctorName: appointment.doctorName,
    department: appointment.department,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    symptoms: appointment.symptoms,
    medicalHistory: appointment.medicalHistory,
    consultationType: appointment.consultationType,
    paymentStatus: appointment.paymentStatus,
    appointmentStatus: appointment.appointmentStatus,
    priority: appointment.priority,
    doctorNotes: appointment.doctorNotes,
    prescription: appointment.prescription,
    createdBy: appointment.createdBy,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt
  };

  const snakeCasePayload = {
    id: appointment.id,
    patient_id: appointment.patientId,
    patient_name: appointment.patientName,
    doctor_id: appointment.doctorId,
    doctor_name: appointment.doctorName,
    department: appointment.department,
    appointment_date: appointment.appointmentDate,
    appointment_time: appointment.appointmentTime,
    symptoms: appointment.symptoms,
    medical_history: appointment.medicalHistory,
    consultation_type: appointment.consultationType,
    payment_status: appointment.paymentStatus,
    appointment_status: appointment.appointmentStatus,
    priority: appointment.priority,
    doctor_notes: appointment.doctorNotes,
    prescription: appointment.prescription,
    created_by: appointment.createdBy,
    created_at: appointment.createdAt,
    updated_at: appointment.updatedAt
  };

  try {
    console.log("Attempting to insert appointment (camelCase) to Supabase 'appointments' table...");
    const { data, error } = await supabase
      .from("appointments")
      .insert([camelCasePayload]);

    if (!error) {
      console.log("Successfully saved appointment (camelCase) to Supabase!");
      return { success: true, schema: "camelCase" };
    }

    // If it is a column error (PostgREST code 42703 or message indicates column error), try snake_case
    if (error.message.includes("column") || error.code === "42703" || error.code === "PGRST204") {
      console.log("camelCase insert failed, trying snake_case payload...");
      const { data: sData, error: sError } = await supabase
        .from("appointments")
        .insert([snakeCasePayload]);

      if (!sError) {
        console.log("Successfully saved appointment (snake_case) to Supabase!");
        return { success: true, schema: "snake_case" };
      }

      console.error("Both camelCase and snake_case inserts failed:", sError);
      return { success: false, error: sError.message, code: sError.code };
    }

    console.error("Error inserting into Supabase:", error);
    return { success: false, error: error.message, code: error.code };
  } catch (err: any) {
    console.error("Exception in saveAppointmentToSupabase:", err);
    return { success: false, error: err.message };
  }
}
