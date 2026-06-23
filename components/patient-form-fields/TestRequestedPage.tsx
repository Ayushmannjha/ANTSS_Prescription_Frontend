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
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { PatientData, TestRequestedEntry } from "../patient-form";

type Props = {
  data: PatientData;

  addTestRequested: () => void;
  removeTestRequested: (id: string) => void;

  updateTestRequested: (
    id: string,
    field: keyof Omit<TestRequestedEntry, "id">,
    value: string
  ) => void;

  isHighlighted?: (field: string) => boolean;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function TestRequestedPage({
  data,
  addTestRequested,
  removeTestRequested,
  updateTestRequested,
  isHighlighted = () => false,
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ClipboardList className="h-4 w-4 text-slate-500" />
            Test Requested
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addTestRequested}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.testsRequested?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No tests requested yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">

              {/* Header Row */}
              <div className="grid grid-cols-[40px_1.5fr_1fr_32px] items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <div>#</div>
                <div>Test Name</div>
                <div>Notes</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-2 pt-1">
                {(data.testsRequested || []).map((tr, index) => (
                  <div
                    key={tr.id}
                    className="grid grid-cols-[40px_1.5fr_1fr_32px] items-center gap-2 px-2"
                  >
                    {/* Index */}
                    <div className="text-center text-[11px] font-medium text-slate-400">
                      {index + 1}
                    </div>

                    {/* Test Name */}
                    {wrapWithMic(
                      `testsRequested.${tr.id}.name`,
                      <Input
                        value={tr.testName}
                        onChange={(e) =>
                          updateTestRequested(tr.id, "testName", e.target.value)
                        }
                        placeholder="e.g., CBC, Lipid Profile"
                        className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${
                          isHighlighted("testsRequested")
                            ? "ring-2 ring-sky-500 bg-sky-50"
                            : ""
                        }`}
                      />
                    )}

                    {/* Notes */}
                    <Input
                      value={tr.notes ?? ""}
                      onChange={(e) =>
                        updateTestRequested(tr.id, "notes", e.target.value)
                      }
                      placeholder="Optional notes"
                      className="h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                    />

                    {/* Delete */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => removeTestRequested(tr.id)}
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