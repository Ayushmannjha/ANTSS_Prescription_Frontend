"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import {
  ClinicalRecord,
  ClinicalRecordKind,
  clinicalRecordsService,
} from "@/src/services/clinicalRecords.service";

type Props = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  kind: ClinicalRecordKind;
  value?: string | null;
  displayKeys: string[];
  onValueChange: (value: string) => void;
  onRecordSelect: (record: ClinicalRecord) => void;
};

const text = (record: ClinicalRecord, keys: string[]) => {
  if (typeof record === "string") return record.trim();

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
    const [hasTyped, setHasTyped] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{
      left: number;
      top: number;
      width: number;
    } | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const safeValue = typeof value === "string" ? value : "";

    const assignInputRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    useEffect(() => {
      if (!hasTyped || !safeValue.trim()) {
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
    }, [hasTyped, kind, safeValue]);

    const matches = useMemo(() => {
      if (!hasTyped) return [];
      const query = safeValue.trim().toLocaleLowerCase();
      if (!query) return [];
      return records.filter((record) =>
        text(record, displayKeys).toLocaleLowerCase().includes(query)
      ).slice(0, 8);
    }, [displayKeys, hasTyped, records, safeValue]);

    useEffect(() => {
      setActive(0);
      setOpen(!loading && matches.length > 0);
    }, [loading, matches.length, safeValue]);

    useEffect(() => {
      if (!open) {
        setDropdownPosition(null);
        return;
      }

      const updatePosition = () => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (!rect) return;
        setDropdownPosition({
          left: rect.left,
          top: rect.bottom + 4,
          width: rect.width,
        });
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }, [open]);

    const select = (record: ClinicalRecord) => {
      onRecordSelect(record);
      setHasTyped(false);
      setOpen(false);
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={assignInputRef}
          value={safeValue}
          autoComplete="off"
          onChange={(event) => {
            setHasTyped(true);
            onValueChange(event.target.value);
          }}
          onFocus={() => hasTyped && matches.length > 0 && setOpen(true)}
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
        {open && dropdownPosition && matches.length > 0 && createPortal(
          <div
            className="fixed z-[9999] max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
            style={dropdownPosition}
          >
            {matches.map((record, index) => (
              <button
                key={String(typeof record === "string" ? record : record.id ?? record.recordId ?? index)}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(record)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${index === active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {text(record, displayKeys)}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>
    );
  }
);

ClinicalRecordAutocomplete.displayName = "ClinicalRecordAutocomplete";
export default ClinicalRecordAutocomplete;
