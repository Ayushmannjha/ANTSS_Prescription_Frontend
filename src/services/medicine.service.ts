import { apiClient } from "./axios";
import { tokenService } from "@/src/modules/auth/services/token.service";

export type MedicineMaster = {
  id?: number | string;
  medicineId?: number | string;
  medicineName: string;
  strength?: string;
  dosageForm?: string;
  defaultDosage?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  defaultInstruction?: string;
  manufacturer?: string;
  active?: boolean;
  activeStatus?: boolean;
};

export type MedicineMasterPayload = {
  id?: number | string;
  medicineId?: number | string;
  medicineName: string;
  strength?: string;
  dosageForm?: string;
  defaultDosage?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  defaultInstruction?: string;
  manufacturer?: string;
  active?: boolean;
  activeStatus?: boolean;
};

const normalizeList = (response: any): MedicineMaster[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const normalizeMedicine = (response: any): MedicineMaster => {
  if (response?.data && !Array.isArray(response.data)) return response.data;
  return response;
};

const getLoggedInUserId = () => {
  const user = tokenService.getUser() as any;
  const userId = user?.id ?? user?.userId;

  if (!userId) {
    throw new Error("Logged-in user id was not found. Please login again.");
  }

  return userId;
};

const withUserId = (params?: Record<string, any>, explicitUserId?: string) => ({
  params: {
    ...(params || {}),
    userId: explicitUserId || getLoggedInUserId(),
  },
});

export const getMedicineId = (medicine: MedicineMaster) =>
  medicine.id ?? medicine.medicineId;

export const getMedicineActive = (medicine: MedicineMaster) =>
  medicine.activeStatus ?? medicine.active ?? true;

export const medicineService = {
  createMedicine: (medicine: MedicineMasterPayload, doctorUserId?: string): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", medicine, withUserId(undefined, doctorUserId))
      .then(normalizeMedicine);
  },

  saveMedicine: (medicine: MedicineMasterPayload, doctorUserId?: string): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", medicine, withUserId(undefined, doctorUserId))
      .then(normalizeMedicine);
  },

  getMedicines: async (doctorUserId?: string): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines", withUserId(undefined, doctorUserId));
    return normalizeList(response);
  },

  getMedicineById: (id: number | string, doctorUserId?: string): Promise<MedicineMaster> => {
    return apiClient
      .get<any>(`/api/medicines/${id}`, withUserId(undefined, doctorUserId))
      .then(normalizeMedicine);
  },

  searchMedicines: async (keyword: string, doctorUserId?: string): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines/search", withUserId({ keyword }, doctorUserId));
    return normalizeList(response);
  },

  deleteMedicine: (id: number | string, doctorUserId?: string): Promise<void> => {
    return apiClient.delete<void>(`/api/medicines/${id}`, withUserId(undefined, doctorUserId));
  },
};
