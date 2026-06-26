"use client"

import type { ReactElement } from "react"
import { VoiceMicField } from "./voice-mic-field"
import { Printer } from "lucide-react"

import PatientPage from "./patient-form-fields/PatientPage"
import MedicalHistoryPage from "./patient-form-fields/MedicalHistoryPage"
import VitalsPage from "./patient-form-fields/VitalsPage"
import ComplaintsPage from "./patient-form-fields/ComplaintsPage"
import GeneralExaminationPage from "./patient-form-fields/GeneralExaminationPage"
import DiagnosisPage from "./patient-form-fields/DiagnosisPage"
import PlanPage from "./patient-form-fields/PlanPage"
import {
  type MedicineEntry,
  type ComplaintEntry,
  type DiagnosisEntry,
  type GeneralExaminationEntry,
  type PastMedicalHistoryEntry,
  type InvestigationEntry,
  type TestRequestedEntry,
  type DocumentEntry,
  type PatientData,
} from "./patient-form-fields/types"

// Re-export types for backward compatibility
export type {
  MedicineEntry,
  ComplaintEntry,
  DiagnosisEntry,
  GeneralExaminationEntry,
  PastMedicalHistoryEntry,
  InvestigationEntry,
  TestRequestedEntry,
  DocumentEntry,
  PatientData,
}

import MedicinesPage from "./patient-form-fields/MedicinesPage"
import QuickNotesPage from "./patient-form-fields/QuickNotesPage"
import InvestigationsPage from "./patient-form-fields/InvestigationsPage"
import TestRequestedPage from "./patient-form-fields/TestRequestedPage"
import DocumentsPage from "./patient-form-fields/DocumentsPage"
import { MedicineMaster } from "@/src/services/medicine.service"

type PatientMicControls = {
  isListening: boolean
  isProcessing: boolean
  isSupported: boolean
  activeVoiceField: string | null
  onMicToggle: (fieldId: string) => void
}

interface PatientFormProps {
  data: PatientData
  onChange: (data: PatientData) => void
  highlightedFields?: string[]
  mic?: PatientMicControls
  registerFieldRef?: (fieldName: string, element: HTMLElement | null) => void
  prescriptionHistoryNode?: React.ReactNode
  prescriptionHistoryLength?: number
}

/* ================= COMPONENT ================= */

export function PatientForm({
  data,
  onChange,
  highlightedFields = [],
  mic,
  registerFieldRef,
  prescriptionHistoryNode,
  prescriptionHistoryLength = 0,
}: PatientFormProps) {

  /* ---------- helpers ---------- */

  const updateField = <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const isHighlighted = (field: string) =>
    highlightedFields.includes(field)

  const inputClass = (field: string) =>
    isHighlighted(field)
      ? "ring-2 ring-accent bg-accent/10 animate-pulse"
      : ""

  const sectionPulseClass = (field: string) =>
    isHighlighted(field) ? "ring-2 ring-accent/60" : ""

  /* ---------- medicines ---------- */

  const addMedicine = () => {
    updateField("medicines", [
      ...(data.medicines || []),
      {
        id: crypto.randomUUID(),
        medicineName: "",
        strength: "",
        dosage: "",
        frequency: "",
        duration: "",
        instruction: "",
        quantity: "",
      },
    ])
  }

  const updateMedicine = (
    id: string,
    field: keyof Omit<MedicineEntry, "id">,
    value: string
  ) => {
    updateField(
      "medicines",
      data.medicines.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    )
  }

  const applyMedicineMaster = (id: string, medicine: MedicineMaster) => {
    updateField(
      "medicines",
      data.medicines.map((m) =>
        m.id === id
          ? {
              ...m,
              medicineName: medicine.medicineName || "",
              strength: medicine.strength || "",
              dosage: medicine.defaultDosage || "",
              frequency: medicine.defaultFrequency || "",
              duration: medicine.defaultDuration || "",
              instruction: medicine.defaultInstruction || "",
            }
          : m
      )
    )
  }

  const removeMedicine = (id: string) => {
    updateField(
      "medicines",
      (data.medicines || []).filter((m) => m.id !== id)
    )
  }

  /* ---------- complaints ---------- */

  const addComplaint = () => {
    updateField("complaints", [
      ...(data.complaints || []),
      {
        id: crypto.randomUUID(),
        complaintName: "",
        complaintFrequency: null,
        severity: null,
        complaintDuration: null,
      },
    ])
  }

  const updateComplaint = (
    id: string,
    field: keyof Omit<ComplaintEntry, "id">,
    value: string
  ) => {
    updateField(
      "complaints",
      data.complaints.map((c) =>
        c.id === id
          ? { ...c, [field]: value || null }
          : c
      )
    )
  }

  const removeComplaint = (id: string) => {
    updateField(
      "complaints",
      (data.complaints || []).filter((c) => c.id !== id)
    )
  }

  /* ---------- diagnosis ---------- */

  const addDiagnosis = () => {
    updateField("diagnoses", [
      ...(data.diagnoses || []),
      {
        id: crypto.randomUUID(),
        diagnosisName: "",
        diagnosisCode: null,
        diagnosisDuration: null,
      },
    ])
  }

  const updateDiagnosis = (
    id: string,
    field: keyof Omit<DiagnosisEntry, "id">,
    value: string
  ) => {
    updateField(
      "diagnoses",
      data.diagnoses.map((d) =>
        d.id === id
          ? { ...d, [field]: value || null }
          : d
      )
    )
  }

  const removeDiagnosis = (id: string) => {
    updateField(
      "diagnoses",
      (data.diagnoses || []).filter((d) => d.id !== id)
    )
  }

  /* ---------- general examinations ---------- */

  const addGeneralExamination = () => {
    updateField("generalExaminations", [
      ...(data.generalExaminations || []),
      {
        id: crypto.randomUUID(),
        examinationName: "",
      },
    ])
  }

  const updateGeneralExamination = (
    id: string,
    value: string
  ) => {
    updateField(
      "generalExaminations",
      data.generalExaminations.map((ge) =>
        ge.id === id
          ? { ...ge, examinationName: value }
          : ge
      )
    )
  }

  const removeGeneralExamination = (id: string) => {
    updateField(
      "generalExaminations",
      (data.generalExaminations || []).filter((ge) => ge.id !== id)
    )
  }

  /* ---------- past medical histories ---------- */

  const addPastMedicalHistory = () => {
    updateField("pastMedicalHistories", [
      ...(data.pastMedicalHistories || []),
      {
        id: crypto.randomUUID(),
        allergies: null,
        currentMedicine: null,
        medicalHistory: null,
      },
    ])
  }

  const updatePastMedicalHistory = (
    id: string,
    field: keyof Omit<PastMedicalHistoryEntry, "id">,
    value: string
  ) => {
    updateField(
      "pastMedicalHistories",
      data.pastMedicalHistories.map((pmh) =>
        pmh.id === id
          ? { ...pmh, [field]: value || null }
          : pmh
      )
    )
  }

  const removePastMedicalHistory = (id: string) => {
    updateField(
      "pastMedicalHistories",
      (data.pastMedicalHistories || []).filter((pmh) => pmh.id !== id)
    )
  }

  /* ---------- investigations ---------- */

  const addInvestigation = () => {
    updateField("investigations", [
      ...(data.investigations || []),
      {
        id: crypto.randomUUID(),
        investigationName: "",
        notes: null,
        documentUrl: null,
        documentFileName: null,
      },
    ])
  }

  const updateInvestigation = (
    id: string,
    field: keyof Omit<InvestigationEntry, "id">,
    value: string
  ) => {
    updateField(
      "investigations",
      data.investigations.map((inv) =>
        inv.id === id
          ? { ...inv, [field]: value || null }
          : inv
      )
    )
  }

  const updateInvestigationMultiple = (
    id: string,
    updates: Partial<Omit<InvestigationEntry, "id">>
  ) => {
    updateField(
      "investigations",
      data.investigations.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      )
    )
  }

  const removeInvestigation = (id: string) => {
    updateField(
      "investigations",
      (data.investigations || []).filter((inv) => inv.id !== id)
    )
  }

  /* ---------- test requested ---------- */

  const addTestRequested = () => {
    updateField("testsRequested", [
      ...(data.testsRequested || []),
      {
        id: crypto.randomUUID(),
        testName: "",
        notes: null,
      },
    ])
  }

  const updateTestRequested = (
    id: string,
    field: keyof Omit<TestRequestedEntry, "id">,
    value: string
  ) => {
    updateField(
      "testsRequested",
      data.testsRequested.map((tr) =>
        tr.id === id
          ? { ...tr, [field]: value || null }
          : tr
      )
    )
  }

  const removeTestRequested = (id: string) => {
    updateField(
      "testsRequested",
      (data.testsRequested || []).filter((tr) => tr.id !== id)
    )
  }

  /* ---------- documents ---------- */

  const addDocument = () => {
    updateField("documents", [
      ...(data.documents || []),
      {
        id: crypto.randomUUID(),
        fileName: "",
        url: "",
      },
    ])
  }

  /** Add a document with pre-set fileName and URL (used for file upload) */
  const addDocumentWithValues = (fileName: string, url: string) => {
    updateField("documents", [
      ...(data.documents || []),
      {
        id: crypto.randomUUID(),
        fileName,
        url,
      },
    ])
  }

  const updateDocument = (
    id: string,
    field: keyof Omit<DocumentEntry, "id">,
    value: string
  ) => {
    updateField(
      "documents",
      data.documents.map((doc) =>
        doc.id === id
          ? { ...doc, [field]: value }
          : doc
      )
    )
  }

  const removeDocument = (id: string) => {
    updateField(
      "documents",
      (data.documents || []).filter((doc) => doc.id !== id)
    )
  }

  /* ---------- mic wrapper (UNCHANGED LOGIC) ---------- */

  const wrapWithMic = (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => {
    if (!mic) return element

    return (
      <VoiceMicField
        isListening={mic.isListening}
        isProcessing={mic.isProcessing}
        isActive={mic.activeVoiceField === fieldId}
        onMicToggle={() => mic.onMicToggle(fieldId)}
      >
        {element}
      </VoiceMicField>
    )
  }

  /* ---------- print handler ---------- */

  const handlePrintPrescription = () => {
    // Store current patient data in localStorage for the prescription page to use
    try {
      localStorage.setItem('prescriptionData', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save prescription data:', e);
    }
    // Open prescription page in new tab for printing
    window.open("/prescription", "_blank");
  }

  /* ================= UI ================= */

  return (
    <div className="w-full">
      <div className="flex justify-end px-2 pb-3 print:hidden">
        <button
          type="button"
          onClick={handlePrintPrescription}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm font-medium"
          title="Print Prescription"
        >
          <Printer className="w-4 h-4" />
          Print Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-none">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN (lg:col-span-5)                         */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Patient Info */}
          <PatientPage
            data={data}
            updateField={updateField}
            inputClass={inputClass}
            mic={mic}
            registerFieldRef={registerFieldRef}
            prescriptionHistoryLength={prescriptionHistoryLength}
          />

          {/* Vitals Section */}
          <VitalsPage
            data={data}
            updateField={updateField}
            inputClass={inputClass}
            sectionPulseClass={sectionPulseClass}
            wrapWithMic={wrapWithMic as ( field: keyof PatientData, node: React.ReactElement ) => React.ReactElement}
            registerFieldRef={registerFieldRef}
          />

          {/* Past Medical History (after Patient Info, before Complaints) */}
          <MedicalHistoryPage
            data={data}
            addPastMedicalHistory={addPastMedicalHistory}
            updatePastMedicalHistory={updatePastMedicalHistory}
            removePastMedicalHistory={removePastMedicalHistory}
            inputClass={inputClass}
            wrapWithMic={wrapWithMic}
          />

          {/* Chief Complaints (Subjective) */}
          <ComplaintsPage
            data={data}
            addComplaint={addComplaint}
            updateComplaint={updateComplaint}
            removeComplaint={removeComplaint}
            wrapWithMic={wrapWithMic}
            isHighlighted={isHighlighted}
          />

          {/* General Examination (Objective) */}
          <GeneralExaminationPage
            data={data}
            addGeneralExamination={addGeneralExamination}
            updateGeneralExamination={updateGeneralExamination}
            removeGeneralExamination={removeGeneralExamination}
            inputClass={inputClass}
            wrapWithMic={wrapWithMic}
            registerFieldRef={registerFieldRef}
          />

          {/* Diagnosis Section */}
          <DiagnosisPage
            data={data}
            addDiagnosis={addDiagnosis}
            removeDiagnosis={removeDiagnosis}
            updateDiagnosis={updateDiagnosis}
            isHighlighted={isHighlighted}
            wrapWithMic={wrapWithMic}
          />

          {/* Plan Section */}
          <PlanPage
            data={data}
            updateField={updateField}
            inputClass={inputClass}
            wrapWithMic={wrapWithMic}
          />

        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN (lg:col-span-7)                        */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {prescriptionHistoryNode}

          {/* Test Requested Section */}
          <TestRequestedPage
            data={data}
            addTestRequested={addTestRequested}
            updateTestRequested={updateTestRequested}
            removeTestRequested={removeTestRequested}
            isHighlighted={isHighlighted}
            wrapWithMic={wrapWithMic}
          />

          {/* Investigations Section */}
          <InvestigationsPage
            data={data}
            addInvestigation={addInvestigation}
            updateInvestigation={updateInvestigation}
            updateInvestigationMultiple={updateInvestigationMultiple}
            removeInvestigation={removeInvestigation}
            isHighlighted={isHighlighted}
            wrapWithMic={wrapWithMic}
          />

          {/* Documents Section */}
          <DocumentsPage
            data={data}
            addDocument={addDocument}
            addDocumentWithValues={addDocumentWithValues}
            updateDocument={updateDocument}
            removeDocument={removeDocument}
            isHighlighted={isHighlighted}
          />

          {/* Medicines (Treatment) */}
          <MedicinesPage
            data={data}
            addMedicine={addMedicine}
            removeMedicine={removeMedicine}
            updateMedicine={updateMedicine}
            applyMedicineMaster={applyMedicineMaster}
            inputClass={inputClass}
            isHighlighted={isHighlighted}
            wrapWithMic={wrapWithMic}
          />

          {/* Digital Signature */}
          <div className="flex justify-end mt-2 mb-8 print:hidden">
            <div className="border border-slate-200 shadow-sm rounded-xl bg-white w-full max-w-[340px] p-5 flex gap-5">
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg h-24 flex items-center justify-center bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold text-center leading-relaxed">Doctor's<br/>Stamp</span>
              </div>
              <div className="flex-[1.2] flex flex-col items-center justify-end border-b-2 border-slate-800 pb-2 relative">
                <div className="h-16 flex items-end justify-center w-full mb-1">
                  <span className="font-['Brush_Script_MT',cursive,serif] italic text-3xl text-slate-700 opacity-90 select-none">
                    Dr. Smith
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold">Signature</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
