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
import { Stethoscope, Plus, Trash2 } from "lucide-react";
import { PatientData, GeneralExaminationEntry } from "../patient-form";

type Props = {
  data: PatientData;

  addGeneralExamination: () => void;
  removeGeneralExamination: (id: string) => void;

  updateGeneralExamination: (
    id: string,
    value: string
  ) => void;

  inputClass?: (field: string) => string;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
  registerFieldRef?: (fieldName: string, el: HTMLElement | null) => void;
};

export default function GeneralExaminationPage({
  data,
  addGeneralExamination,
  removeGeneralExamination,
  updateGeneralExamination,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
  registerFieldRef,
}: Props) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Stethoscope className="h-4 w-4 text-slate-500" />
            General Examination
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addGeneralExamination}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.generalExaminations?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No general examinations yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-2">
            {(data.generalExaminations || []).map((ge, index) => (
              <div
                key={ge.id}
                className="flex items-center gap-2"
              >
                {/* Index */}
                <div className="text-center text-[11px] font-medium text-slate-400 w-6 flex-shrink-0">
                  {index + 1}
                </div>

                {/* Examination Name */}
                {wrapWithMic(
                  `generalExaminations.${ge.id}.name`,
                  <Input
                    value={ge.examinationName}
                    onChange={(e) =>
                      updateGeneralExamination(ge.id, e.target.value)
                    }
                    placeholder="e.g., Afebrile, BP normal"
                    className={`h-8 text-xs flex-1 bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("generalExaminations")}`}
                    ref={(el) => registerFieldRef?.(`generalExaminations.${ge.id}`, el)}
                  />
                )}

                {/* Delete */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  onClick={() => removeGeneralExamination(ge.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}