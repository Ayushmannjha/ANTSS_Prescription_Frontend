import axios from "axios";
import { API_BASE_URL, apiClient } from "@/src/services/axios";
import { 
  ApiDetailedPrescriptionResponse, 
  ApiDoctorResponse, 
  ApiHospitalResponse, 
  ApiClinicResponse,
  ApiResponseEnvelope 
} from "@/types/prescription";

export const prescriptionApi = {
  /**
   * Fetches detailed prescription by ID (includes consultation, medicines, diagnostics, documents)
   */
  getDetailedPrescription: async (id: number): Promise<ApiDetailedPrescriptionResponse> => {
    return apiClient.get<ApiDetailedPrescriptionResponse>(`/api/prescription/detail/${id}`);
  },

  /**
   * Fetches a QR/share prescription without requiring the viewer to be logged in.
   * Backend must expose one of these public routes for scanned QR links to work.
   */
  getPublicDetailedPrescription: async (id: number): Promise<ApiDetailedPrescriptionResponse> => {
    const publicPaths = [
      `/api/prescription/public/${id}`,
      `/api/prescription/public/detail/${id}`,
      `/api/public/prescription/${id}`,
      `/api/public/prescription/detail/${id}`,
    ];

    let lastError: unknown = null;
    for (const path of publicPaths) {
      try {
        const response = await axios.get<ApiDetailedPrescriptionResponse>(`${API_BASE_URL}${path}`, {
          headers: { "Content-Type": "application/json" },
        });
        return response.data;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },

  /**
   * Fetches doctor details by UUID (contains signatureUrl, hospitalId, clinicId)
   */
  getDoctorDetails: async (id: string): Promise<ApiResponseEnvelope<ApiDoctorResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiDoctorResponse>>(`/api/doctors/${id}`);
  },

  /**
   * Fetches hospital details by ID
   */
  getHospitalDetails: async (id: number): Promise<ApiResponseEnvelope<ApiHospitalResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiHospitalResponse>>(`/api/hospitals/${id}`);
  },

  /**
   * Fetches clinic details by ID
   */
  getClinicDetails: async (id: number): Promise<ApiResponseEnvelope<ApiClinicResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiClinicResponse>>(`/api/clinics/${id}`);
  },

  /**
   * Fetches current logged-in doctor's profile
   */
  getDoctorProfile: async (): Promise<ApiResponseEnvelope<ApiDoctorResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiDoctorResponse>>("/api/doctors/profile");
  }
};
