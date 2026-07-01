"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MedicineMaster,
  MedicineMasterPayload,
  getMedicineActive,
} from "@/src/services/medicine.service";

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Drops",
  "Ointment",
  "Gel",
  "Inhaler",
  "Powder",
  "Suspension",
  "Other",
];

type MedicineFormState = {
  medicineName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  active: boolean;
};

type Props = {
  initialMedicine?: MedicineMaster | null;
  defaultName?: string;
  saving?: boolean;
  submitLabel?: string;
  onSubmit: (payload: MedicineMasterPayload) => Promise<void> | void;
  onCancel?: () => void;
};

const emptyState = (defaultName = ""): MedicineFormState => ({
  medicineName: defaultName,
  genericName: "",
  strength: "",
  dosageForm: "Tablet",
  manufacturer: "",
  active: true,
});

/**
 * Builds a `MedicineMasterPayload` from form state.
 * Only includes fields that the backend `MedicineMasterRequest` DTO accepts.
 */
export function buildMedicinePayload(
  state: MedicineFormState
): MedicineMasterPayload {
  return {
    medicineName: state.medicineName.trim(),
    genericName: state.genericName.trim() || undefined,
    strength: state.strength.trim() || undefined,
    dosageForm: state.dosageForm || undefined,
    manufacturer: state.manufacturer.trim() || undefined,
    active: state.active,
  };
}

export default function MedicineMasterForm({
  initialMedicine,
  defaultName = "",
  saving = false,
  submitLabel = "Save medicine",
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<MedicineFormState>(() => emptyState(defaultName));
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (initialMedicine) {
      setForm({
        medicineName: initialMedicine.medicineName || "",
        genericName: initialMedicine.genericName || "",
        strength: initialMedicine.strength || "",
        dosageForm: initialMedicine.dosageForm || "Tablet",
        manufacturer: initialMedicine.manufacturer || "",
        active: getMedicineActive(initialMedicine),
      });
      return;
    }

    setForm(emptyState(defaultName));
  }, [defaultName, initialMedicine]);

  const updateField = <K extends keyof MedicineFormState>(
    field: K,
    value: MedicineFormState[K]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "medicineName") setNameError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.medicineName.trim()) {
      setNameError("Medicine name is required.");
      return;
    }

    await onSubmit(buildMedicinePayload(form));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Medicine Name — Full Width */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="medicineName">Medicine Name *</Label>
          <Input
            id="medicineName"
            value={form.medicineName}
            onChange={(event) => updateField("medicineName", event.target.value)}
            aria-invalid={Boolean(nameError)}
            placeholder="e.g., Paracetamol"
          />
          {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
        </div>

        {/* Generic Name */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="genericName">Generic Name</Label>
          <Input
            id="genericName"
            value={form.genericName}
            onChange={(event) => updateField("genericName", event.target.value)}
            placeholder="e.g., Acetaminophen"
          />
          <p className="text-xs text-muted-foreground">
            The generic/chemical name of the medicine (optional)
          </p>
        </div>

        {/* Strength */}
        <div className="space-y-1.5">
          <Label htmlFor="strength">Strength</Label>
          <Input
            id="strength"
            value={form.strength}
            onChange={(event) => updateField("strength", event.target.value)}
            placeholder="e.g., 650mg"
          />
        </div>

        {/* Dosage Form */}
        <div className="space-y-1.5">
          <Label>Dosage Form</Label>
          <Select
            value={form.dosageForm}
            onValueChange={(value) => updateField("dosageForm", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {DOSAGE_FORMS.map((formName) => (
                <SelectItem key={formName} value={formName}>
                  {formName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Manufacturer */}
        <div className="space-y-1.5">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={form.manufacturer}
            onChange={(event) => updateField("manufacturer", event.target.value)}
            placeholder="e.g., Sun Pharma"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="activeStatus" className="text-sm">
            Active Status
          </Label>
          <Switch
            id="activeStatus"
            checked={form.active}
            onCheckedChange={(checked) => updateField("active", checked)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
