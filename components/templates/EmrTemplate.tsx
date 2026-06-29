"use client";

import { useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileSearch,
  FileText,
  FolderOpen,
  HeartPulse,
  History,
  LayoutDashboard,
  ListChecks,
  Pill,
  Printer,
  Stethoscope,
  Syringe,
  TestTube2,
  Users,
} from "lucide-react";
import { usePatientForm, BaseTemplateProps } from "@/hooks/usePatientForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PatientPage from "../patient-form-fields/PatientPage";
import MedicalHistoryPage from "../patient-form-fields/MedicalHistoryPage";
import VitalsPage from "../patient-form-fields/VitalsPage";
import ComplaintsPage from "../patient-form-fields/ComplaintsPage";
import GeneralExaminationPage from "../patient-form-fields/GeneralExaminationPage";
import DiagnosisPage from "../patient-form-fields/DiagnosisPage";
import PlanPage from "../patient-form-fields/PlanPage";
import MedicinesPage from "../patient-form-fields/MedicinesPage";
import InvestigationsPage from "../patient-form-fields/InvestigationsPage";
import TestRequestedPage from "../patient-form-fields/TestRequestedPage";
import DocumentsPage from "../patient-form-fields/DocumentsPage";

export default function EmrTemplate(props: BaseTemplateProps) {
  const {
    data,
    mic,
    registerFieldRef,
    prescriptionHistoryNode,
    prescriptionHistoryLength,
    visitHistory = [],
  } = props;

  const helpers = usePatientForm(props);
  const [visitsOpen, setVisitsOpen] = useState(true);
  const [documentsPreviewOpen, setDocumentsPreviewOpen] = useState(false);
  const [labReportsPreviewOpen, setLabReportsPreviewOpen] = useState(false);

  const [selectedVisit, setSelectedVisit] = useState<{
    prescriptionId: number;
    createdAt?: string;
  } | null>(null);

  const navigationItems = [
    { icon: LayoutDashboard, label: "Timeline", active: true },
    { icon: Syringe, label: "Prescriptions", active: false },
    { icon: FileText, label: "Lab Reports", active: false },
    { icon: FolderOpen, label: "Documents", active: false },
  ];

  const formSections = [
    { id: "chief-complaints", label: "Chief Complaints", icon: ClipboardList },
    { id: "past-medical-history", label: "Medical History", icon: History },
    { id: "general-examination", label: "Examination", icon: Stethoscope },
    { id: "diagnosis", label: "Diagnosis", icon: FileSearch },
    { id: "medicines", label: "Medicines", icon: Pill },
    { id: "plan", label: "Plan & Follow-up", icon: ListChecks },
    { id: "investigations", label: "Investigations", icon: TestTube2 },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "vitals", label: "Vitals", icon: HeartPulse },
    { id: "tests-requested", label: "Tests Requested", icon: Activity },
  ];

  const navigateToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="w-full pb-14">
      <div className="sticky top-[57px] z-40 -mx-3 sm:-mx-4 lg:-mx-6 mb-4 border-b border-slate-200 bg-white shadow-sm">
        <PatientPage
          data={data}
          updateField={helpers.updateField}
          inputClass={helpers.inputClass}
          mic={mic}
          registerFieldRef={registerFieldRef}
          prescriptionHistoryLength={prescriptionHistoryLength}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-[250px_minmax(560px,1fr)_320px]">
        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-[142px] xl:h-[calc(100vh-155px)] xl:self-start xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1">
          <nav className="hidden shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            {navigationItems.slice(0, 1).map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium transition-colors ${
                  active && !visitsOpen
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </span>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setVisitsOpen((open) => !open)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium transition-colors ${
                visitsOpen
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              aria-expanded={visitsOpen}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0" />
                <span className="truncate">Visits</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                  {visitHistory.length}
                </span>
              </span>

              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                  visitsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {visitsOpen && (
              <div className="border-y border-slate-100 bg-slate-50/80 px-2 py-2">
                {visitHistory.length === 0 ? (
                  <p className="px-3 py-2 text-[10px] text-slate-400">
                    No previous visits
                  </p>
                ) : (
                  <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                    {visitHistory.map((visit) => (
                      <button
                        key={visit.prescriptionId}
                        type="button"
                        onClick={() => setSelectedVisit(visit)}
                        className="flex w-full min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-left text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
                      >
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">
                          {visit.createdAt
                            ? new Date(visit.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Visit date unavailable"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {navigationItems.slice(1).map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === "Documents") {
                    setDocumentsPreviewOpen(true);
                    return;
                  }

                  if (label === "Lab Reports") {
                    setLabReportsPreviewOpen(true);
                    return;
                  }

                  if (label === "Prescriptions") {
                    document.getElementById("prescription-history")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium transition-colors ${
                  active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </span>
                {!active && <span className="shrink-0 text-[10px] text-slate-400">›</span>}
              </button>
            ))}
          </nav>

          <nav className="hidden shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold text-slate-800">
                Form Navigation
              </p>
              <p className="mt-0.5 text-[9px] text-slate-400">
                Jump to prescription section
              </p>
            </div>

            <div className="max-h-56 space-y-0.5 overflow-y-auto p-2">
              {formSections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigateToSection(id)}
                  className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] font-medium text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div id="documents" className="shrink-0 scroll-mt-[150px]">
            <DocumentsPage
              data={data}
              addDocument={helpers.addDocument}
              addDocumentWithValues={helpers.addDocumentWithValues}
              updateDocument={helpers.updateDocument}
              removeDocument={helpers.removeDocument}
              isHighlighted={helpers.isHighlighted}
              previewOpen={documentsPreviewOpen}
              onPreviewOpenChange={setDocumentsPreviewOpen}
            />
          </div>

          <div id="prescription-history" className="shrink-0 scroll-mt-[150px]">
            {prescriptionHistoryNode}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          <div id="chief-complaints" className="scroll-mt-[150px]">
            <ComplaintsPage
              data={data}
              addComplaint={helpers.addComplaint}
              updateComplaint={helpers.updateComplaint}
              removeComplaint={helpers.removeComplaint}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="past-medical-history" className="scroll-mt-[150px]">
            <MedicalHistoryPage
              data={data}
              addPastMedicalHistory={helpers.addPastMedicalHistory}
              updatePastMedicalHistory={helpers.updatePastMedicalHistory}
              removePastMedicalHistory={helpers.removePastMedicalHistory}
              inputClass={helpers.inputClass}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="general-examination" className="scroll-mt-[150px]">
            <GeneralExaminationPage
              data={data}
              addGeneralExamination={helpers.addGeneralExamination}
              updateGeneralExamination={helpers.updateGeneralExamination}
              removeGeneralExamination={helpers.removeGeneralExamination}
              inputClass={helpers.inputClass}
              wrapWithMic={helpers.wrapWithMic}
              registerFieldRef={registerFieldRef}
            />
          </div>

          <div id="diagnosis" className="scroll-mt-[150px]">
            <DiagnosisPage
              data={data}
              addDiagnosis={helpers.addDiagnosis}
              removeDiagnosis={helpers.removeDiagnosis}
              updateDiagnosis={helpers.updateDiagnosis}
              isHighlighted={helpers.isHighlighted}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="medicines" className="scroll-mt-[150px]">
            <MedicinesPage
              data={data}
              addMedicine={helpers.addMedicine}
              removeMedicine={helpers.removeMedicine}
              updateMedicine={helpers.updateMedicine}
              applyMedicineMaster={helpers.applyMedicineMaster}
              inputClass={helpers.inputClass}
              isHighlighted={helpers.isHighlighted}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="plan" className="scroll-mt-[150px]">
            <PlanPage
              data={data}
              updateField={helpers.updateField}
              inputClass={helpers.inputClass}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="investigations" className="scroll-mt-[150px]">
            <InvestigationsPage
              data={data}
              addInvestigation={helpers.addInvestigation}
              updateInvestigation={helpers.updateInvestigation}
              updateInvestigationMultiple={helpers.updateInvestigationMultiple}
              removeInvestigation={helpers.removeInvestigation}
              wrapWithMic={helpers.wrapWithMic}
              previewOpen={labReportsPreviewOpen}
              onPreviewOpenChange={setLabReportsPreviewOpen}
            />
          </div>
        </section>

        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-[142px] xl:h-[calc(100vh-155px)] xl:self-start xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1">
          <div id="vitals" className="shrink-0 scroll-mt-[150px]">
            <VitalsPage
              data={data}
              updateField={helpers.updateField}
              inputClass={helpers.inputClass}
              sectionPulseClass={helpers.sectionPulseClass}
              wrapWithMic={helpers.wrapWithMic as any}
              registerFieldRef={registerFieldRef}
            />
          </div>

          {data.allergies && data.allergies !== "None" && data.allergies !== "N/A" && (
            <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                Drug allergy
              </p>
              <p className="font-semibold">{data.allergies}</p>
            </div>
          )}

          <div id="tests-requested" className="shrink-0 scroll-mt-[150px]">
            <TestRequestedPage
              data={data}
              addTestRequested={helpers.addTestRequested}
              updateTestRequested={helpers.updateTestRequested}
              removeTestRequested={helpers.removeTestRequested}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex h-12 items-center justify-end border-t border-slate-200 bg-white/95 px-4 shadow-[0_-4px_16px_rgba(15,23,42,0.05)] backdrop-blur print:hidden">
        <button
          id="print-prescription-action"
          type="button"
          onClick={helpers.handlePrintPrescription}
          className="flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Prescription
        </button>
      </div>

      <Dialog
        open={selectedVisit !== null}
        onOpenChange={(open) => !open && setSelectedVisit(null)}
      >
        <DialogContent className="flex h-[94vh] max-h-[94vh] !w-[calc(100vw-3rem)] !max-w-[1200px] flex-col gap-0 overflow-hidden border-slate-200 bg-slate-100 p-0">
          <DialogHeader className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 pr-14">
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              Prescription details
            </DialogTitle>

            <DialogDescription className="text-xs">
              {selectedVisit?.createdAt
                ? new Date(selectedVisit.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Selected visit"}
              {" · Read only"}
            </DialogDescription>
          </DialogHeader>

          {selectedVisit && (
            <iframe
              key={selectedVisit.prescriptionId}
              src={`/prescription?id=${selectedVisit.prescriptionId}`}
              title={`Prescription from ${
                selectedVisit.createdAt || selectedVisit.prescriptionId
              }`}
              className="min-h-0 w-full flex-1 border-0 bg-slate-100"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
