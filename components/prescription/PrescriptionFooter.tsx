import React from "react";
import QRCode from "react-qr-code";
import { MappedDoctorInfo } from "@/types/prescription";
import { qrCodeService } from "@services/qrCode.service";


interface PrescriptionFooterProps {
  doctor: MappedDoctorInfo;
  prescriptionId?: number;
  prescriptionData?: any;
}

export const PrescriptionFooter: React.FC<PrescriptionFooterProps> = ({ doctor, prescriptionId, prescriptionData }) => {
  const validPrescriptionId = Number(prescriptionId);
  const [mounted, setMounted] = React.useState(false);
  const [prescriptionUrl, setPrescriptionUrl] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
    if (Number.isFinite(validPrescriptionId) && validPrescriptionId > 0) {
      const qrDetails = qrCodeService.generateQrCodeDetails(validPrescriptionId, 24, prescriptionData);
      setPrescriptionUrl(qrDetails.qrUrl);
    }
  }, [validPrescriptionId]);

  return (
    <footer className="prescription-footer mt-8">
      {/* Footer Content */}
      <div className="flex justify-between items-end mb-6">
        {/* Left Side: QR Code */}
        <div className="pl-4">
          <div className="flex flex-col items-start">
            {mounted && prescriptionUrl ? (
              <>
                <div className="p-1.5 bg-white border border-slate-200 inline-block mb-1">
                  <QRCode value={prescriptionUrl} size={64} level="M" />
                </div>
                <span className="text-[8px] text-slate-500 tracking-wider font-semibold">SCAN FOR DIGITAL COPY</span>
              </>
            ) : (
              <div className="w-[78px] text-[8px] font-semibold uppercase leading-tight tracking-wider text-slate-400">
                Save prescription to generate QR
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Signature Placement */}
        <div className="text-center pr-4">
          <div className="h-16 w-44 flex flex-col justify-end items-center border-b border-dashed border-slate-300 mb-1 pb-1">
            {doctor.signatureUrl ? (
              <img 
                src={doctor.signatureUrl} 
                alt="Doctor Signature" 
                className="max-h-14 object-contain" 
              />
            ) : (
              <div className="h-12 w-full" />
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Doctor Signature / Stamp
          </div>
        </div>
      </div>

      {/* Footer Divider & Disclaimer */}
      <div className="border-t border-slate-300 pt-2 text-center">
        <p className="text-[10px] text-slate-500 italic">
          Substitute with equivalent Generics as required. • This is a digitally signed prescription.
        </p>
      </div>
    </footer>
  );
};
