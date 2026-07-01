import { apiClient } from "./axios";

/**
 * Matches the backend JPA entity `MedicineMaster`.
 * Fields: medicineId, medicineName, genericName, strength, dosageForm, manufacturer, active, createdAt
 */
export type MedicineMaster = {
  medicineId: number;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  active?: boolean;
  createdAt?: string;
};

/**
 * Matches the backend `MedicineMasterRequest` DTO exactly.
 * Fields: medicineName (required), genericName, strength, dosageForm, manufacturer, active
 */
export type MedicineMasterPayload = {
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  active?: boolean;
};

/**
 * Normalize backend list responses — handles arrays, wrapped { data: [] }, and paginated { content: [] }.
 */
const normalizeList = (response: any): MedicineMaster[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

/**
 * Normalize a single medicine response — handles raw entity and wrapped { data: {} }.
 */
const normalizeMedicine = (response: any): MedicineMaster => {
  if (response?.data && !Array.isArray(response.data)) return response.data;
  return response;
};

/**
 * Extract the medicine ID from a `MedicineMaster` entity.
 * The backend entity uses `medicineId` as the primary key.
 */
export const getMedicineId = (medicine: MedicineMaster): number | undefined =>
  medicine.medicineId;

/**
 * Extract the active status from a `MedicineMaster` entity.
 */
export const getMedicineActive = (medicine: MedicineMaster): boolean =>
  medicine.active ?? true;

export const medicineService = {
  /**
   * POST /api/medicines — Create a new medicine master entry.
   */
  createMedicine: (payload: MedicineMasterPayload): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", payload)
      .then(normalizeMedicine);
  },

  /**
   * POST /api/medicines — Alias for createMedicine (backend only has POST).
   */
  saveMedicine: (payload: MedicineMasterPayload): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", payload)
      .then(normalizeMedicine);
  },

  /**
   * "Update" a medicine by deleting the old one and creating a new one.
   * The backend has no PUT endpoint, so this is the only approach without backend changes.
   * Returns the newly created medicine (with a new medicineId).
   */
  updateMedicine: async (
    oldMedicineId: number,
    payload: MedicineMasterPayload
  ): Promise<MedicineMaster> => {
    await apiClient.delete<void>(`/api/medicines/${oldMedicineId}`);
    return apiClient
      .post<any>("/api/medicines", payload)
      .then(normalizeMedicine);
  },

  /**
   * GET /api/medicines — Fetch all medicines for the current user.
   */
  getMedicines: async (): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines");
    return normalizeList(response);
  },

  /**
   * GET /api/medicines/{id} — Fetch a single medicine by ID.
   */
  getMedicineById: (id: number): Promise<MedicineMaster> => {
    return apiClient
      .get<any>(`/api/medicines/${id}`)
      .then(normalizeMedicine);
  },

  /**
   * GET /api/medicines/search?keyword=... — Search medicines by keyword.
   */
  searchMedicines: async (keyword: string): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines/search", {
      params: { keyword },
    });
    return normalizeList(response);
  },

  /**
   * DELETE /api/medicines/{id} — Delete a medicine by ID.
   */
  deleteMedicine: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/medicines/${id}`);
  },
};
