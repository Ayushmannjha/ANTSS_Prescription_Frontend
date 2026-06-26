"use client";

import { JSX, ReactElement } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, Trash2 } from "lucide-react";
import { PatientData, DiagnosisEntry } from "../patient-form";

type Props = {
  data: PatientData;

  addDiagnosis: () => void;
  removeDiagnosis: (id: string) => void;

  updateDiagnosis: (
    id: string,
    field: keyof Omit<DiagnosisEntry, "id">,
    value: string
  ) => void;

  isHighlighted?: (field: string) => boolean;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function DiagnosisPage({
  data,
  addDiagnosis,
  removeDiagnosis,
  updateDiagnosis,
  isHighlighted = () => false,
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            Diagnosis
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addDiagnosis}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.diagnoses?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No diagnoses yet. Use voice or click "Add".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">

              {/* Header */}
              <div className="grid grid-cols-[52px_1.35fr_1fr_0.7fr_36px] items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <div>#</div>
                <div>Diagnosis</div>
                <div>Code</div>
                <div>Duration</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-2 pt-1">
                {(data.diagnoses || []).map((d, index) => (
                  <div
                    key={d.id}
                    className="grid grid-cols-[52px_1.35fr_1fr_0.7fr_36px] items-start gap-2 px-2"
                  >
                    <div className="pt-2 text-center text-[11px] font-medium text-slate-400">
                      {index + 1}
                    </div>

                    {wrapWithMic(
                      `diagnoses.${d.id}.diagnosisName`,
                      <Input
                        value={d.diagnosisName}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "diagnosisName", e.target.value)
                        }
                        placeholder="e.g., Acute bronchitis"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic(
                      `diagnoses.${d.id}.diagnosisCode`,
                      <Input
                        value={d.diagnosisCode ?? ""}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "diagnosisCode", e.target.value)
                        }
                        placeholder="Code"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic(
                      `diagnoses.${d.id}.diagnosisDuration`,
                      <Input
                        value={d.diagnosisDuration ?? ""}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "diagnosisDuration", e.target.value)
                        }
                        placeholder="Duration"
                        className="h-8 text-sm"
                      />
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => removeDiagnosis(d.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}