"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileDown, Calendar, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { qrCodeService } from "@services/qrCode.service";
import QrExpirationMessage from "@/components/prescription/QrExpirationMessage";
import PrescriptionView from "@/components/prescription/PrescriptionView";

function DownloadContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const tokenParam = searchParams.get("token");
  const expiresParam = searchParams.get("expires");
  const dataParam = searchParams.get("data");

  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [formattedExpiry, setFormattedExpiry] = useState("");
  const [prescriptionId, setPrescriptionId] = useState<number | null>(null);
  const [decodedPrescription, setDecodedPrescription] = useState<any>(null);

  useEffect(() => {
    async function verifyLink() {
      if (!idParam || !tokenParam || !expiresParam) {
        setIsValid(false);
        setErrorMessage("Missing secure download credentials. Please check the URL.");
        setVerifying(false);
        return;
      }

      const pId = parseInt(idParam, 10);
      const expiresMs = parseInt(expiresParam, 10);

      if (isNaN(pId) || isNaN(expiresMs)) {
        setIsValid(false);
        setErrorMessage("Invalid parameter formatting. The link is corrupt.");
        setVerifying(false);
        return;
      }

      setPrescriptionId(pId);

      // Verify the QR parameters (mimics backend validation API)
      const result = await qrCodeService.verifyQrCode(pId, tokenParam, expiresMs);

      if (result.valid) {
        setIsValid(true);
        // Format expiry timestamp nicely
        const dateObj = new Date(expiresMs);
        setFormattedExpiry(
          dateObj.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) +
            " at " +
            dateObj.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })
        );
      } else {
        setIsValid(false);
        setErrorMessage(result.error || "The link has expired or is invalid.");
      }
      setVerifying(false);
    }

    verifyLink();
  }, [idParam, tokenParam, expiresParam]);

  // Handle PDF Download
  const handleDownload = async () => {
    if (!prescriptionId) return;
    
    setDownloading(true);
    
    try {
      // Small timeout to allow state to reflect downloading
      await new Promise(resolve => setTimeout(resolve, 300));
      window.print();
      
      setDownloadComplete(true);
      // Reset status after a few seconds
      setTimeout(() => {
        setDownloadComplete(false);
      }, 4000);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback
    } finally {
      setDownloading(false);
    }
  };

  // Automatically trigger download once verified as valid
  useEffect(() => {
    if (isValid && prescriptionId && !downloadComplete && !downloading) {
      // Small timeout to give user visual feedback of landing on verification screen
      const timer = setTimeout(() => {
        handleDownload();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isValid, prescriptionId]);

  // Loading / Verification Screen
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-100">Verifying Link Security</h3>
            <p className="text-sm text-slate-400">Performing secure decryption and authenticity checks...</p>
          </div>
        </div>
      </div>
    );
  }

  // Expired Screen (Renders the reusable component)
  if (!isValid) {
    return <QrExpirationMessage clinicName="the Prescription Desk" clinicPhone="+91-1234-5678" />;
  }

  // Valid / Download Screen - Render the actual prescription view
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Verification Banner */}
      <div className="w-full bg-slate-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between shadow-md print:hidden z-10 sticky top-0">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="font-bold text-sm">Secure Prescription Link Verified</h2>
            <p className="text-xs text-slate-400">Valid until {formattedExpiry}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {downloading ? (
              <><span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> Preparing File...</>
            ) : downloadComplete ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved</>
            ) : (
              <><FileDown className="w-4 h-4" /> Download Full PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Render Actual Prescription Content */}
      <div className="flex-1 w-full bg-slate-100">
        {(decodedPrescription || prescriptionId) && (
          <PrescriptionView 
            prescriptionId={decodedPrescription ? undefined : (prescriptionId || undefined)} 
            prescription={decodedPrescription} 
          />
        )}
      </div>
    </div>
  );
}

export default function PrescriptionDownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="text-sm text-slate-400">Loading secure download gateway...</p>
          </div>
        </div>
      }
    >
      <DownloadContent />
    </Suspense>
  );
}
