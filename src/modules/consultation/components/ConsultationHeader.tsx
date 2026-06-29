import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, RotateCcw, CheckCircle, Stethoscope, Plus, Printer, FileText } from "lucide-react";
import { TemplateSelector, TemplateId } from "@/components/TemplateSelector";

interface ConsultationHeaderProps {
  goBack: () => void;
  handleReset: () => void;
  handleSave: () => void;
  saveStatus: "idle" | "saving" | "saved";
  isReadOnly: boolean;
  hasTodayPrescription?: boolean;
}

export function ConsultationHeader({
  goBack,
  handleReset,
  handleSave,
  saveStatus,
  isReadOnly,
  hasTodayPrescription,
}: ConsultationHeaderProps) {
  const [template, setTemplate] = useState<TemplateId>("EMR");

  useEffect(() => {
    const stored = localStorage.getItem("preferred_prescription_template") as TemplateId;
    if (stored) {
      setTemplate(stored);
    }
  }, []);

  const handleTemplateSelect = (newTemplate: TemplateId) => {
    setTemplate(newTemplate);
    localStorage.setItem("preferred_prescription_template", newTemplate);
    window.dispatchEvent(new CustomEvent("templateChanged", { detail: newTemplate }));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-y-2 px-3 py-2 lg:px-5">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={goBack} className="h-8 gap-1 px-2 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="flex items-center gap-1.5 text-xs font-bold tracking-[0.16em] text-slate-800">
                MEDOS
                {hasTodayPrescription && (
                  <Badge
                    variant="default"
                    className="h-4 border-none bg-emerald-50 px-1.5 py-0 text-[9px] font-semibold text-emerald-600 hover:bg-emerald-50"
                  >
                    Today's Rx
                  </Badge>
                )}
              </h1>
              <p className="hidden text-[9px] text-slate-400 sm:block">Prescription workspace</p>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <TemplateSelector currentTemplate={template} onSelect={handleTemplateSelect} />

          <div className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("print-prescription-action")?.click()}
              className="h-8 gap-1.5 text-xs text-slate-500"
            >
              <FileText className="h-3.5 w-3.5" />
              PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("print-prescription-action")?.click()}
              className="h-8 gap-1.5 text-xs text-slate-500"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            {isReadOnly ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                New Consultation
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-slate-500">
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className="h-8 rounded-lg bg-blue-600 px-4 text-xs text-white hover:bg-blue-700"
                >
                  {saveStatus === "saved" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : saveStatus === "saving" ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Complete
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default ConsultationHeader;
