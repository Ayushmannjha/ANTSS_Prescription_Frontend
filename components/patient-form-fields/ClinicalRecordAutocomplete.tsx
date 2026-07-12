"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ClinicalRecord,
  ClinicalRecordKind,
  clinicalRecordsService,
} from "@/src/services/clinicalRecords.service";

type Props = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  kind: ClinicalRecordKind;
  value: string;
  displayKeys: string[];
  onValueChange: (value: string) => void;
  onRecordSelect: (record: ClinicalRecord) => void;
};

const text = (record: ClinicalRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && String(value).trim()) return String(value);
  }
  return "";
};

export const recordValue = (record: ClinicalRecord, ...keys: string[]) =>
  text(record, keys);

const ClinicalRecordAutocomplete = forwardRef<HTMLInputElement, Props>(
  ({ kind, value, displayKeys, onValueChange, onRecordSelect, onBlur, onKeyDown, ...props }, ref) => {
    const [records, setRecords] = useState<ClinicalRecord[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(0);

    useEffect(() => {
      if (!value.trim()) {
        setOpen(false);
        return;
      }
      let current = true;
      setLoading(true);
      clinicalRecordsService.list(kind)
        .then((items) => current && setRecords(items))
        .catch(() => current && setRecords([]))
        .finally(() => current && setLoading(false));
      return () => { current = false; };
    }, [kind, value]);

    const matches = useMemo(() => {
      const query = value.trim().toLocaleLowerCase();
      if (!query) return [];
      return records.filter((record) =>
        text(record, displayKeys).toLocaleLowerCase().includes(query)
      ).slice(0, 8);
    }, [displayKeys, records, value]);

    useEffect(() => {
      setActive(0);
      setOpen(!loading && matches.length > 0);
    }, [loading, matches.length, value]);

    const select = (record: ClinicalRecord) => {
      onRecordSelect(record);
      setOpen(false);
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          value={value}
          autoComplete="off"
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={() => matches.length > 0 && setOpen(true)}
          onBlur={(event) => {
            window.setTimeout(() => setOpen(false), 120);
            onBlur?.(event);
          }}
          onKeyDown={(event) => {
            if (open && matches.length) {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => (index + 1) % matches.length);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => (index - 1 + matches.length) % matches.length);
              } else if (event.key === "Enter") {
                event.preventDefault();
                select(matches[active]);
              } else if (event.key === "Escape") {
                setOpen(false);
              }
            }
            onKeyDown?.(event);
          }}
        />
        {open && matches.length > 0 && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
            {matches.map((record, index) => (
              <button
                key={String(record.id ?? record.recordId ?? index)}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(record)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${index === active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {text(record, displayKeys)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ClinicalRecordAutocomplete.displayName = "ClinicalRecordAutocomplete";
export default ClinicalRecordAutocomplete;
