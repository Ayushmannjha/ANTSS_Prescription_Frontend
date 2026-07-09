import React from "react";
import { ShieldAlert, Phone, RefreshCw } from "lucide-react";

interface QrExpirationMessageProps {
  clinicName?: string;
  clinicPhone?: string;
}

export const QrExpirationMessage: React.FC<QrExpirationMessageProps> = ({
  clinicName = "your clinic",
  clinicPhone,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="relative max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-[0_20px_50px_rgba(239,68,68,0.1)] text-center overflow-hidden animate-fade-in">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-red-500/10 to-red-500/20 rounded-2xl border border-red-500/30 flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-200 via-slate-100 to-red-100 bg-clip-text text-transparent mb-3">
          QR Code Expired
        </h2>

        {/* Required Message */}
        <p className="text-slate-300 text-base leading-relaxed mb-6 font-medium px-2">
          This QR code has expired. Please contact your doctor to obtain a new QR code.
        </p>

        {/* Explanation Alert box */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-8 text-left text-sm text-slate-400 space-y-2">
          <div className="font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Security & Privacy Notice
          </div>
          <p className="leading-normal">
            For security and privacy reasons, prescription digital download links are only valid for a limited, configurable duration. The prescription itself remains permanently active on the clinic servers.
          </p>
        </div>

        {/* Clinic info / Action Buttons */}
        <div className="space-y-3">
          {clinicPhone && (
            <a
              href={`tel:${clinicPhone}`}
              className="w-full flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 active:bg-slate-700 border border-slate-700 text-slate-200 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              Call {clinicName}
            </a>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700/50 text-slate-300 py-3 px-4 rounded-xl font-semibold transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            Check Link Status Again
          </button>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          Verified Secure by ANTSS EMR Platform
        </div>
      </div>
      
      {/* Inject basic keyframe animation */}
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
};
export default QrExpirationMessage;
