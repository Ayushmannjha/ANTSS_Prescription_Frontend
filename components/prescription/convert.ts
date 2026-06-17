import { MappedPrescription, MappedVital, MappedMedicine, MappedTest } from "@/types/prescription";

const defaultClinicInfo = {
  name: "SMS hospital",
  address: "B/503, Business Center, MG Road, Pune - 411000.",
  phone: "5465647658",
  timings: "Timing: 09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday",
  logo: "/_DOCTOR.jpeg"
};

const defaultDoctorInfo = {
  name: "Dr. Akshara",
  qualification: "M.S.",
  registrationNo: "MMC 2018",
  specialization: "General Physician",
  signatureUrl: ""
};

export function convertPatientDataToPrescription(
  patientData: any,
  clinicInfo?: typeof defaultClinicInfo,
  doctorInfo?: typeof defaultDoctorInfo
): MappedPrescription {
  const visitDateObj = new Date();
  
  // Format visit date as DD-MMM-YYYY
  const formattedVisitDate = visitDateObj.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace(/ /g, '-');
  
  const consultation = patientData.consultation || patientData;

  // Convert vitals
  const vitals: MappedVital[] = [];
  if (consultation.bp || consultation.bloodPressureSystolic || consultation.bloodPressureDiastolic) {
    vitals.push({
      label: "Blood Pressure",
      value: consultation.bp || `${consultation.bloodPressureSystolic || '---'}/${consultation.bloodPressureDiastolic || '---'}`,
      unit: "mmHg"
    });
  }
  if (consultation.pulse) {
    vitals.push({ label: "Pulse", value: consultation.pulse.toString(), unit: "bpm" });
  }
  if (consultation.temperature) {
    vitals.push({ label: "Temperature", value: consultation.temperature.toString(), unit: "°F" });
  }
  if (consultation.oxygenSaturation || consultation.spo2) {
    vitals.push({ label: "SpO2", value: (consultation.oxygenSaturation || consultation.spo2).toString(), unit: "%" });
  }
  if (consultation.weight) {
    vitals.push({ label: "Weight", value: consultation.weight.toString(), unit: "kg" });
  }
  if (consultation.height) {
    vitals.push({ label: "Height", value: consultation.height.toString(), unit: "cm" });
  }
  if (consultation.respiratoryRate) {
    vitals.push({ label: "Resp Rate", value: consultation.respiratoryRate.toString(), unit: "bpm" });
  }

  // Convert complaints
  const chiefComplaints: string[] = [];
  if (consultation.complaints && consultation.complaints.length > 0) {
    consultation.complaints.forEach((c: any) => {
      const name = c.complaint || c.complaintName;
      if (name) {
        let str = name.toUpperCase();
        const details = [];
        if (c.severity) details.push(c.severity.toUpperCase());
        if (c.frequency || c.complaintFrequency) details.push((c.frequency || c.complaintFrequency).toUpperCase());
        if (c.duration || c.complaintDuration) details.push((c.duration || c.complaintDuration).toUpperCase());
        if (details.length > 0) str += ` (${details.join(', ')})`;
        chiefComplaints.push(str);
      }
    });
  } else if (consultation.complaintName) {
    let str = consultation.complaintName.toUpperCase();
    const details = [];
    if (consultation.severity) details.push(consultation.severity.toUpperCase());
    if (consultation.complaintFrequency) details.push(consultation.complaintFrequency.toUpperCase());
    if (consultation.complaintDuration) details.push(consultation.complaintDuration.toUpperCase());
    if (details.length > 0) str += ` (${details.join(', ')})`;
    chiefComplaints.push(str);
  } else if (consultation.chiefComplaint) {
    chiefComplaints.push(consultation.chiefComplaint.toUpperCase());
  }

  // Convert general examination to Clinical Findings
  const clinicalFindings: string[] = [];
  if (consultation.generalExamination) {
    consultation.generalExamination.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed) clinicalFindings.push(trimmed.toUpperCase());
    });
  }

  // Convert allergies and history
  const allergies: string[] = [];
  if (consultation.allergies) allergies.push(consultation.allergies);
  if (consultation.pastMedicalHistories && consultation.pastMedicalHistories.length > 0) {
    consultation.pastMedicalHistories.forEach((pmh: any) => {
      if (pmh.allergies) allergies.push(pmh.allergies);
    });
  }

  const pastHistory: string[] = [];
  if (consultation.medicalHistory) pastHistory.push(consultation.medicalHistory);
  if (consultation.currentMedicine || consultation.currentMedications) {
    pastHistory.push(`Current Medications: ${consultation.currentMedicine || consultation.currentMedications}`);
  }
  if (consultation.pastMedicalHistories && consultation.pastMedicalHistories.length > 0) {
    consultation.pastMedicalHistories.forEach((pmh: any) => {
      if (pmh.medicalHistory) pastHistory.push(pmh.medicalHistory);
      if (pmh.currentMedicine) pastHistory.push(`Current Medications: ${pmh.currentMedicine}`);
    });
  }

  // Convert diagnosis
  let diagnosis = "";
  if (consultation.diagnoses && consultation.diagnoses.length > 0) {
    diagnosis = consultation.diagnoses.map((d: any) => {
      const name = d.diagnosis || d.diagnosisName || "";
      const code = d.snomedCode || d.diagnosisCode || "";
      return `${name.toUpperCase()}${code ? ` (${code})` : ''}`;
    }).join(", ");
  } else if (consultation.diagnosisName) {
    diagnosis = `${consultation.diagnosisName.toUpperCase()}${consultation.diagnosisCode ? ` (${consultation.diagnosisCode})` : ''}`;
  }

  // Convert medicines
  const medicines: MappedMedicine[] = patientData.medicines?.map((m: any, idx: number) => {
    let name = m.medicineName || m.name || "Unknown Medicine";
    if (m.strength) {
      name += ` ${m.strength}`;
    }
    return {
      id: m.prescriptionMedicineId || m.id || idx,
      genericName: name,
      brandName: m.medicineName || m.name,
      dosage: m.dosage || m.dose || "---",
      frequency: m.frequency || "---",
      instructions: m.instruction || m.instructions || "",
      duration: m.duration || "---",
      quantity: m.quantity
    };
  }) || [];

  // Convert diagnostics/tests from testRequested array
  const diagnostics: MappedTest[] = [];
  const testsSource = patientData.testRequested || patientData.investigations || consultation.testRequested || consultation.investigations;
  if (testsSource && testsSource.length > 0) {
    testsSource.forEach((tr: any, i: number) => {
      const name = tr.testName || tr.investigationName || tr.name;
      if (name) {
        diagnostics.push({
          id: tr.id || `test-${i}`,
          name: name
        });
      }
    });
  }
  
  if (patientData.investigations && patientData.investigations.length > 0 && testsSource !== patientData.investigations) {
    patientData.investigations.forEach((inv: any, i: number) => {
      if (inv.investigationName) {
        diagnostics.push({ id: inv.id || `inv-${i}`, name: inv.investigationName });
      }
    });
  }

  if (consultation.testsRequested && typeof consultation.testsRequested === 'string') {
    consultation.testsRequested.split(',').forEach((test: string, i: number) => {
      const trimmed = test.trim();
      if (trimmed) {
        diagnostics.push({
          id: `test-str-${i}`,
          name: trimmed
        });
      }
    });
  }

  // Convert advice
  const advice: string[] = [];
  if (consultation.advice) {
    consultation.advice.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed) advice.push(trimmed.toUpperCase());
    });
  }

  // Convert follow-up
  let followUp = undefined;
  if (consultation.followUpDate) {
    const fDate = new Date(consultation.followUpDate);
    const formatted = fDate.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, '-');
    followUp = {
      days: 0,
      note: "",
      date: formatted
    };
  } else if (consultation.followUp) {
    const days = parseInt(consultation.followUp) || 5;
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + days);
    const formattedFollowUpDate = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, '-');
    
    followUp = {
      days,
      note: `Review after ${days} days`,
      date: formattedFollowUpDate
    };
  }

  const dynamicClinicInfo = {
    name: consultation.clinicName || consultation.hospitalName || clinicInfo?.name || defaultClinicInfo.name,
    address: consultation.clinicAddress || consultation.hospitalAddress || clinicInfo?.address || defaultClinicInfo.address,
    phone: consultation.clinicPhone || consultation.hospitalPhone || clinicInfo?.phone || defaultClinicInfo.phone,
    timings: clinicInfo?.timings || "",
    logo: clinicInfo?.logo || "/_DOCTOR.jpeg"
  };

  const dynamicDoctorInfo = {
    name: consultation.doctorName || doctorInfo?.name || defaultDoctorInfo.name,
    qualification: consultation.qualification || doctorInfo?.qualification || defaultDoctorInfo.qualification,
    registrationNo: consultation.doctorRegistrationNo || doctorInfo?.registrationNo || defaultDoctorInfo.registrationNo,
    specialization: consultation.specialization || doctorInfo?.specialization || defaultDoctorInfo.specialization,
    signatureUrl: consultation.doctorSignatureUrl || doctorInfo?.signatureUrl
  };

  return {
    prescriptionId: Number(patientData.prescriptionId || consultation.consultationId) || 0,
    clinic: dynamicClinicInfo,
    doctor: dynamicDoctorInfo,
    patient: {
      id: consultation.registrationNumber || consultation.registrationId?.toString() || `RX-${visitDateObj.getTime().toString().slice(-6)}`,
      name: consultation.patientName || consultation.name || "Unknown Patient",
      age: consultation.age || 0,
      gender: consultation.gender || "Other",
      contactNumber: consultation.mobileNumber || consultation.contactNumber || undefined,
      visitDate: formattedVisitDate,
      prescriptionId: consultation.registrationNumber || consultation.registrationId?.toString() || `RX-${visitDateObj.getTime().toString().slice(-6)}`,
      address: consultation.patientAddress || consultation.address || ""
    },
    vitals,
    chiefComplaints,
    clinicalFindings,
    pastHistory,
    allergies,
    diagnosis,
    medicines,
    testsRecommended: diagnostics,
    advice,
    followUp,
    additionalNotes: patientData.notes || consultation.quickNotes || patientData.quickNotes
  };
}
