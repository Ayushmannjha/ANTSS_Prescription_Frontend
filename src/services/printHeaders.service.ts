import { apiClient, axiosInstance } from "./axios";

export interface PrintHeader {
  id?: number;
  headerId?: number;
  entityId?: number | string;
  entityType?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

type PrintHeadersResponse = {
  success?: boolean;
  message?: string;
  data?: PrintHeader[];
};

const unwrapHeaders = (response: PrintHeadersResponse | PrintHeader[] | any): PrintHeader[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const printHeadersService = {
  async uploadHeader(params: {
    entityId: number;
    entityType: string;
    image: File;
  }): Promise<PrintHeader> {
    const formData = new FormData();
    formData.append("entityId", String(params.entityId));
    formData.append("entityType", params.entityType);
    formData.append("image", params.image);

    const response = await apiClient.post<{ data?: PrintHeader } | PrintHeader>(
      "/api/print-headers",
      formData
    );

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }

    return response as PrintHeader;
  },

  async getHeaders(params?: { entityId?: number; entityType?: string }): Promise<PrintHeader[]> {
    const response = await apiClient.get<PrintHeadersResponse | PrintHeader[]>("/api/print-headers", {
      params,
    });
    return unwrapHeaders(response);
  },

  async getPrescriptionPdf(headerId: number, prescriptionId: number): Promise<Blob> {
    const response = await axiosInstance.get(
      `/api/print-headers/${headerId}/prescriptions/${prescriptionId}/pdf`,
      {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    return response.data;
  },
};
