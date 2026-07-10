"use client";

import { useParams, useSearchParams } from "next/navigation";
import PrescriptionView from "@/components/prescription/PrescriptionView";

export default function PublicPrescriptionPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const prescriptionId = Number(params.id);
  const expiresParam = searchParams.get("expires");

  if (!Number.isFinite(prescriptionId) || prescriptionId <= 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 shadow-lg text-center">
          <h2 className="text-lg font-bold text-red-600">Invalid Prescription Link</h2>
          <p className="text-sm text-slate-600 mt-2">This QR code does not contain a valid prescription ID.</p>
        </div>
      </div>
    );
  }

  if (expiresParam) {
    const expiresMs = Number(expiresParam);
    if (Number.isFinite(expiresMs) && Date.now() > expiresMs) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h2>
            <p className="text-slate-600">
              This QR prescription link has expired. Please contact the clinic to request a new copy.
            </p>
          </div>
        </div>
      );
    }
  }

  return <PrescriptionView prescriptionId={prescriptionId} publicAccess />;
}
