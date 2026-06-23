"use client";

import { JSX, ReactElement } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle, Pill, Plus, Trash2 } from "lucide-react";
import { PatientData, PastMedicalHistoryEntry } from "../patient-form";

type Props = {
  data: PatientData;

  addPastMedicalHistory: () => void;
  removePastMedicalHistory: (id: string) => void;

  updatePastMedicalHistory: (
    id: string,
    field: keyof Omit<PastMedicalHistoryEntry, "id">,
    value: string
  ) => void;

  inputClass?: (field: string) => string;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function MedicalHistoryPage({
  data,
  addPastMedicalHistory,
  removePastMedicalHistory,
  updatePastMedicalHistory,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="h-4 w-4 text-slate-500" />
            Past Medical History
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addPastMedicalHistory}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.pastMedicalHistories?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No past medical history yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {(data.pastMedicalHistories || []).map((pmh, index) => (
              <div
                key={pmh.id}
                className="rounded-xl border border-slate-100 bg-slate-50/30 p-3 relative"
              >
                {/* Header with index and delete button */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Entry #{index + 1}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => removePastMedicalHistory(pmh.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {/* Allergies */}
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                      Allergies
                    </label>
                    {wrapWithMic(
                      `pastMedicalHistories.${pmh.id}.allergies`,
                      <Textarea
                        rows={2}
                        value={pmh.allergies ?? ""}
                        onChange={(e) =>
                          updatePastMedicalHistory(pmh.id, "allergies", e.target.value)
                        }
                        placeholder="List allergies..."
                        className={`text-xs resize-none bg-white border-slate-200 focus-visible:ring-sky-500 rounded-lg ${inputClass("allergies")}`}
                      />
                    )}
                  </div>

                  {/* Current Medications */}
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Pill className="h-3.5 w-3.5 text-sky-500" />
                      Current Medications
                    </label>
                    {wrapWithMic(
                      `pastMedicalHistories.${pmh.id}.currentMedicine`,
                      <Textarea
                        rows={2}
                        value={pmh.currentMedicine ?? ""}
                        onChange={(e) =>
                          updatePastMedicalHistory(pmh.id, "currentMedicine", e.target.value)
                        }
                        placeholder="List current medications..."
                        className={`text-xs resize-none bg-white border-slate-200 focus-visible:ring-sky-500 rounded-lg ${inputClass("currentMedicine")}`}
                      />
                    )}
                  </div>

                  {/* Medical History */}
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <FileText className="h-3.5 w-3.5 text-emerald-500" />
                      Medical History
                    </label>
                    {wrapWithMic(
                      `pastMedicalHistories.${pmh.id}.medicalHistory`,
                      <Textarea
                        rows={2}
                        value={pmh.medicalHistory ?? ""}
                        onChange={(e) =>
                          updatePastMedicalHistory(pmh.id, "medicalHistory", e.target.value)
                        }
                        placeholder="Past surgeries, chronic conditions..."
                        className={`text-xs resize-none bg-white border-slate-200 focus-visible:ring-sky-500 rounded-lg ${inputClass("medicalHistory")}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}