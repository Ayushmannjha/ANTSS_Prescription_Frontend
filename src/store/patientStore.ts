import { create } from "zustand";
import { patientService } from "../services/patient.service";
import { doctorService } from "../services/doctor.service";
import { consultationService } from "../services/consultation.service";
import { PatientResponse } from "../../types/backend";
import type { PatientRegistrationEvent } from "../services/patient-registration.websocket";
import type { ConsultationRequestEvent } from "../services/consultation-request.websocket";

import { useAuthStore } from "./authStore";

interface PatientState {
  patients: PatientResponse[];
  consultations: any[];
  loading: boolean;
  error: string | null;
  activePatient: PatientResponse | null;
  fetchPatients: () => Promise<void>;
  upsertRegistration: (event: PatientRegistrationEvent) => void;
  upsertConsultationRequest: (event: ConsultationRequestEvent) => void;
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

      const consultationsResponse = user?.userType === "DOCTOR"
        ? await consultationService.getMyConsultationRequests()
        : doctorId
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
        status: consultation.status,
        priority: consultation.priority,
        consultReason: consultation.consultReason,
        requestedAt: consultation.requestedAt,
      }));

      set({ patients: mappedPatients, consultations, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch patients", loading: false });
    }
  },

  upsertRegistration: (event) => {
    const patient = {
      ...event.patient,
      patientId: event.patient.patientId,
      registrationId: event.registrationId,
      registrationNumber: event.registrationNumber,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    set((state) => ({
      patients: [
        patient,
        ...state.patients.filter(
          (existing: any) =>
            Number(existing.registrationId) !== event.registrationId,
        ),
      ],
    }));
  },

  upsertConsultationRequest: (event) => {
    const consultation = {
      consultationId: event.consultationId,
      consultationNumber: event.consultationNumber,
      registrationId: event.registrationId,
      registrationNumber: event.registrationNumber,
      patientId: event.registrationId,
      patientName: event.patientName,
      mobileNumber: event.mobileNumber,
      gender: event.gender,
      age: event.age,
      doctorId: event.doctorId,
      doctorName: event.doctorName,
      status: event.status,
      priority: event.priority,
      consultReason: event.consultReason,
      createdAt: event.requestedAt || new Date().toISOString(),
      requestedAt: event.requestedAt,
    };

    const patient = {
      patientId: event.registrationId,
      patientName: event.patientName,
      mobileNumber: event.mobileNumber || undefined,
      gender: event.gender || "",
      age: Number(event.age || 0),
      createdAt: event.requestedAt || new Date().toISOString(),
      updatedAt: event.requestedAt || new Date().toISOString(),
      registrationId: event.registrationId,
      registrationNumber: event.registrationNumber || undefined,
      consultationId: event.consultationId,
      status: event.status,
      priority: event.priority,
      consultReason: event.consultReason,
      requestedAt: event.requestedAt,
    } as any;

    set((state) => ({
      consultations: [
        consultation,
        ...state.consultations.filter(
          (existing: any) => Number(existing.consultationId) !== event.consultationId,
        ),
      ],
      patients: [
        patient,
        ...state.patients.filter(
          (existing: any) => Number(existing.consultationId) !== event.consultationId,
        ),
      ],
    }));
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
