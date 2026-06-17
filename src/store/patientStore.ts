import { create } from "zustand";
import { patientService } from "../services/patient.service";
import { doctorService } from "../services/doctor.service";
import { consultationService } from "../services/consultation.service";
import { BackendPatient } from "../../types/backend";

interface PatientState {
  patients: BackendPatient[];
  loading: boolean;
  error: string | null;
  activePatient: BackendPatient | null;
  fetchPatients: () => Promise<void>;
  setActivePatient: (patient: BackendPatient | null) => void;
  registerPatient: (data: any) => Promise<any>;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  loading: false,
  error: null,
  activePatient: null,

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      // 1. Fetch doctor profile to get doctorId
      const profileResponse = await doctorService.getDoctorProfile();
      const doctorId = profileResponse?.data?.id || profileResponse?.id;

      if (!doctorId) {
        throw new Error("Could not extract doctor ID from profile");
      }

      // 2. Fetch consultations for this doctor
      const consultationsResponse = await consultationService.getConsultationsByDoctor(doctorId);
      const consultations = (consultationsResponse as any)?.data || consultationsResponse;

      // 3. Extract unique patients from consultations
      const uniquePatientsMap = new Map<number, BackendPatient>();
      
      if (Array.isArray(consultations)) {
        consultations.forEach((cons: any) => {
          if (cons.patientId && !uniquePatientsMap.has(cons.patientId)) {
            uniquePatientsMap.set(cons.patientId, {
              patientId: cons.patientId,
              patientName: cons.patientName,
              mobileNumber: cons.mobileNumber,
              gender: cons.gender,
              age: cons.age,
              address: cons.patientAddress,
            });
          }
        });
      }

      const data = Array.from(uniquePatientsMap.values());
      set({ patients: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch patients", loading: false });
    }
  },

  setActivePatient: (patient) => {
    set({ activePatient: patient });
  },

  registerPatient: async (data) => {
    set({ loading: true });
    try {
      const newPatient = await patientService.createPatient(data);
      set((state) => ({
        patients: [...state.patients, newPatient],
        loading: false,
      }));
      return newPatient;
    } catch (err: any) {
      set({ error: err.message || "Registration failed", loading: false });
      throw err;
    }
  },
}));
