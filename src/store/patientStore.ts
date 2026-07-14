import { create } from "zustand";
import { patientService } from "../services/patient.service";
import { doctorService } from "../services/doctor.service";
import { consultationService } from "../services/consultation.service";
import { PatientResponse } from "../../types/backend";

import { useAuthStore } from "./authStore";

interface PatientState {
  patients: PatientResponse[];
  consultations: any[];
  loading: boolean;
  error: string | null;
  activePatient: PatientResponse | null;
  fetchPatients: () => Promise<void>;
  setActivePatient: (patient: PatientResponse | null) => void;
  registerPatient: (data: any) => Promise<any>;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  consultations: [],
  loading: false,
  error: null,
  activePatient: null,

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      let doctorId = user?.doctorId;

      if (!doctorId && user?.userType === "DOCTOR") {
        const profileResponse = await doctorService.getDoctorProfile();
        doctorId = profileResponse?.data?.id || profileResponse?.id;
      }

      const consultationsResponse = doctorId
        ? await consultationService.getConsultationsByDoctor(doctorId)
        : await consultationService.getAllConsultations();
      const consultationsData = (consultationsResponse as any)?.data || consultationsResponse;
      const consultations = Array.isArray(consultationsData)
        ? [...consultationsData].sort((a: any, b: any) => {
            const aCreatedAt = Date.parse(a.createdAt || "");
            const bCreatedAt = Date.parse(b.createdAt || "");

            if (!Number.isNaN(aCreatedAt) && !Number.isNaN(bCreatedAt)) {
              return bCreatedAt - aCreatedAt;
            }

            return Number(b.consultationId || 0) - Number(a.consultationId || 0);
          })
        : [];

      const mappedPatients = consultations.map((consultation: any) => ({
        patientId: consultation.patientId || consultation.registrationId,
        patientName: consultation.patientName,
        mobileNumber: consultation.mobileNumber,
        gender: consultation.gender,
        age: consultation.age,
        address: consultation.patientAddress || consultation.address,
        state: consultation.state,
        city: consultation.city,
        pincode: consultation.pincode,
        dateOfBirth: consultation.dateOfBirth || null,
        createdAt: consultation.createdAt || consultation.updatedAt || new Date().toISOString(),
        updatedAt: consultation.updatedAt || consultation.createdAt || new Date().toISOString(),
        registrationId: consultation.registrationId,
        registrationNumber: consultation.registrationNumber,
        consultationId: consultation.consultationId,
        weight: consultation.weight,
        height: consultation.height,
        bp: consultation.bp,
        pulse: consultation.pulse,
        temperature: consultation.temperature,
        spo2: consultation.spo2,
        respiratoryRate: consultation.respiratoryRate,
      }));

      set({ patients: mappedPatients, consultations, loading: false });
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
      const registration = await patientService.createRegistration(data);
      const newPatient: PatientResponse = {
        patientId: registration.patientId,
        patientName: registration.patientName,
        mobileNumber: registration.mobileNumber,
        gender: registration.gender,
        dateOfBirth: registration.dateOfBirth,
        age: registration.age,
        address: registration.address,
        state: registration.state,
        city: registration.city,
        pincode: registration.pincode,
        createdAt: registration.createdAt ?? new Date().toISOString(),
        updatedAt: registration.updatedAt ?? registration.createdAt ?? new Date().toISOString(),
      };
      set((state) => ({
        patients: [newPatient, ...state.patients],
        loading: false,
      }));
      return registration;
    } catch (err: any) {
      set({ error: err.message || "Registration failed", loading: false });
      throw err;
    }
  },
}));
