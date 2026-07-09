"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileDown, Calendar, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { qrCodeService } from "@services/qrCode.service";
import QrExpirationMessage from "@/components/prescription/QrExpirationMessage";

function DownloadContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const tokenParam = searchParams.get("token");
  const expiresParam = searchParams.get("expires");

  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [formattedExpiry, setFormattedExpiry] = useState("");
  const [prescriptionId, setPrescriptionId] = useState<number | null>(null);

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
    if (!prescriptionId || downloading) return;

    try {
      setDownloading(true);
      const pdfBlob = await qrCodeService.downloadPrescriptionPdf(prescriptionId);
      qrCodeService.triggerBlobDownload(pdfBlob, `Prescription-${prescriptionId}.pdf`);
      setDownloadComplete(true);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to retrieve prescription PDF. Please retry.");
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

  // Valid / Download Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="relative max-w-md w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-[0_30px_60px_rgba(30,41,59,0.5)] overflow-hidden animate-fade-in">
        
        {/* Ambient background accent */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Secure badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Link Verified & Secure
        </div>

        {/* Document Presentation */}
        <div className="flex flex-col items-center mb-8">
          <div className="group relative w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 mb-5 transition-transform duration-300 hover:scale-105">
            <FileDown className="w-12 h-12 text-white group-hover:animate-bounce" />
            {downloading && (
              <span className="absolute -inset-1 rounded-2xl border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 mb-1">
            Download Prescription
          </h2>
          <span className="text-sm font-semibold text-slate-400">
            ID: #{prescriptionId}
          </span>
        </div>

        {/* Expiry / Metadata Card */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4.5 mb-8 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="block text-slate-400 text-xs font-medium uppercase tracking-wider">Link Valid Until</span>
              <span className="font-semibold text-slate-200">{formattedExpiry}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 disabled:opacity-50 text-white py-3.5 px-5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Retrieving Document...
              </>
            ) : downloadComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Prescription Downloaded
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>

          {/* User Status / Auto-download helper */}
          <div className="text-center">
            {downloading ? (
              <p className="text-xs text-blue-400 font-medium animate-pulse">
                Generating secure document copy...
              </p>
            ) : downloadComplete ? (
              <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> File saved. Check your device downloads.
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Your download should begin automatically. If it doesn't, click above.
              </p>
            )}
          </div>
        </div>

        {/* Brand footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 text-center tracking-wide font-medium">
          Digital Prescription Delivery System • Confidential Healthcare Data
        </div>
      </div>

      {/* Slide / Fade animation injection */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
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
