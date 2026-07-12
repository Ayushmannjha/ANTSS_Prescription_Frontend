import { apiClient } from "./axios";
import { tokenService } from "../modules/auth/services/token.service";

export type ClinicalRecordKind =
  | "diagnoses"
  | "chief-complaints"
  | "general-examinations"
  | "past-medical-histories"
  | "investigations"
  | "tests-requested";

export type ClinicalRecord = Record<string, unknown> | string;

type ClinicalRecordIdentity = {
  doctorId: string;
  facilityType: "hospitals" | "clinics";
  facilityId: number;
};

let identityPromise: Promise<ClinicalRecordIdentity> | null = null;
const recordRequests = new Map<ClinicalRecordKind, Promise<ClinicalRecord[]>>();

const validId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

async function resolveIdentity(): Promise<ClinicalRecordIdentity> {
  if (identityPromise) return identityPromise;

  identityPromise = (async () => {
    const user = tokenService.getUser() as any;
    let doctorId = user?.doctorId ?? user?.id;
    let hospitalId = validId(user?.hospitalId);
    let clinicId = validId(user?.clinicId);

    if (!doctorId || (!hospitalId && !clinicId)) {
      const profile: any = await apiClient.get("/api/doctors/profile");
      const doctor = profile?.data ?? profile;
      doctorId = doctorId ?? doctor?.id ?? doctor?.doctorId;
      hospitalId = hospitalId ?? validId(doctor?.hospitalId ?? doctor?.hospital?.id);
      clinicId = clinicId ?? validId(doctor?.clinicId ?? doctor?.clinic?.id);
    }

    if (!doctorId || (!hospitalId && !clinicId)) {
      throw new Error("Doctor or facility information is unavailable");
    }

    return {
      doctorId: String(doctorId),
      facilityType: hospitalId ? ("hospitals" as const) : ("clinics" as const),
      facilityId: hospitalId ?? clinicId!,
    };
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
      .then(({ doctorId, facilityType, facilityId }) =>
        apiClient.get<any>(
          `/api/clinical-records/doctors/${doctorId}/${facilityType}/${facilityId}/${kind}`
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
