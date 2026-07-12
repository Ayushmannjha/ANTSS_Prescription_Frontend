import { apiClient } from "./axios";
import { tokenService } from "../modules/auth/services/token.service";

export type ClinicalRecordKind =
  | "diagnoses"
  | "chief-complaints"
  | "general-examinations"
  | "past-medical-histories"
  | "investigations"
  | "tests-requested";

export type ClinicalRecord = Record<string, unknown>;

let identityPromise: Promise<{ doctorId: string; hospitalId: number }> | null = null;
const recordRequests = new Map<ClinicalRecordKind, Promise<ClinicalRecord[]>>();

async function resolveIdentity() {
  if (identityPromise) return identityPromise;

  identityPromise = (async () => {
    const user = tokenService.getUser() as any;
    let doctorId = user?.doctorId ?? user?.id;
    let hospitalId = Number(user?.hospitalId);

    if (!doctorId || !Number.isFinite(hospitalId)) {
      const profile: any = await apiClient.get("/api/doctors/profile");
      const doctor = profile?.data ?? profile;
      doctorId = doctorId ?? doctor?.id ?? doctor?.doctorId;
      hospitalId = Number.isFinite(hospitalId)
        ? hospitalId
        : Number(doctor?.hospitalId ?? doctor?.hospital?.id);
    }

    if (!doctorId || !Number.isFinite(hospitalId)) {
      throw new Error("Doctor or hospital information is unavailable");
    }
    return { doctorId: String(doctorId), hospitalId };
  })().catch((error) => {
    identityPromise = null;
    throw error;
  });

  return identityPromise;
}

export const clinicalRecordsService = {
  async list(kind: ClinicalRecordKind): Promise<ClinicalRecord[]> {
    const cached = recordRequests.get(kind);
    if (cached) return cached;

    const request = resolveIdentity()
      .then(({ doctorId, hospitalId }) =>
        apiClient.get<any>(
          `/api/clinical-records/doctors/${doctorId}/hospitals/${hospitalId}/${kind}`
        )
      )
      .then((response) => {
        const records = response?.data ?? response;
        return Array.isArray(records) ? records : [];
      })
      .catch((error) => {
        recordRequests.delete(kind);
        throw error;
      });

    recordRequests.set(kind, request);
    return request;
  },
};
