"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Stethoscope,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  FileText,
  Edit,
  Save,
  X,
  Briefcase,
  Loader2,
  CheckCircle,
  Building,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/src/store/authStore";
import { doctorService } from "@/src/services/doctor.service";

export default function DoctorProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form states
  const [editForm, setEditForm] = useState({
    doctorName: "",
    specialization: "",
    qualification: "",
    experienceYears: 0,
    email: "",
    mobileNumber: "",
    registrationNumber: "",
    signatureUrl: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let docData = null;
      
      // 1. First try to fetch doctor by ID (obtained during login)
      if (user?.doctorId) {
        try {
          const res = await doctorService.getDoctorById(user.doctorId);
          docData = res?.data || res;
        } catch (err) {
          console.warn("Failed to fetch by doctorId, trying fallback profile endpoint...", err);
        }
      }
      
      // 2. Fall back to the profile endpoint if by-ID fetch failed or wasn't possible
      if (!docData) {
        const res = await doctorService.getDoctorProfile();
        docData = res?.data || res;
      }

      if (docData) {
        setProfile(docData);
        setEditForm({
          doctorName: docData.doctorName || "",
          specialization: docData.specialization || "",
          qualification: docData.qualification || "",
          experienceYears: docData.experienceYears || 0,
          email: docData.email || "",
          mobileNumber: docData.mobileNumber || "",
          registrationNumber: docData.registrationNumber || "",
          signatureUrl: docData.signatureUrl || "",
          status: docData.status || "ACTIVE",
        });
      } else {
        toast.error("Doctor profile details could not be resolved.");
      }
    } catch (e: any) {
      console.error("Failed to load doctor profile", e);
      toast.error(e?.message || "Failed to load doctor profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }

    const handleRouteChange = (e: any) => {
      if (e.detail === '/doctor/profile') {
        if (user) fetchProfile();
      }
    };

    window.addEventListener('app-route-change', handleRouteChange);
    return () => window.removeEventListener('app-route-change', handleRouteChange);
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.doctorName || !editForm.specialization || !editForm.qualification || !editForm.registrationNumber) {
      toast.error("Please fill in all required fields (Name, Specialization, Qualification, Reg Number).");
      return;
    }

    const doctorId = profile?.id || user?.doctorId;
    if (!doctorId) {
      toast.error("Doctor identifier is missing.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...editForm,
        experienceYears: Number(editForm.experienceYears),
      };
      const response = await doctorService.updateDoctor(doctorId, payload);
      toast.success("Profile updated successfully!");
      setProfile(response?.data || response);
      setIsEditing(false);
      fetchProfile(); // Refresh details
    } catch (err: any) {
      console.error("Failed to update profile", err);
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin text-primary text-4xl mb-4">⏳</div>
        <p className="text-muted-foreground font-medium">Loading Doctor Profile...</p>
      </div>
    );
  }

  // Get initials for profile placeholder
  const getInitials = (name: string) => {
    if (!name) return "DR";
    const parts = name.replace("Dr.", "").trim().split(" ");
    return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header bar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Doctor Portal</h1>
              <p className="text-xs text-muted-foreground">Clinical Dashboard</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/patients" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Patients
            </Link>
            <Link href="/medicine-master" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Medicine Master
            </Link>
            <Link href="/doctor/profile" className="text-sm font-semibold text-primary transition-colors">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 space-y-8">
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 md:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg border-4 border-background">
              {getInitials(profile?.doctorName)}
            </div>
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h2 className="text-2xl md:text-3xl font-bold">{profile?.doctorName}</h2>
                <Badge variant={profile?.status === "ACTIVE" ? "default" : "secondary"} className="w-fit self-center">
                  {profile?.status || "ACTIVE"}
                </Badge>
              </div>
              <p className="text-muted-foreground font-medium">
                {profile?.specialization} • {profile?.qualification}
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start text-xs font-semibold text-primary">
                <span>Code: {profile?.doctorCode}</span>
                <span>•</span>
                <span>Reg No: {profile?.registrationNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="gap-1 text-muted-foreground">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Layout split */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info Box */}
          <div className="lg:col-span-2 space-y-6">
            {!isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Professional Details
                  </CardTitle>
                  <CardDescription>Verified practitioner registration and degrees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Doctor Name</p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">{profile?.doctorName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Specialization</p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">{profile?.specialization}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Qualification</p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">{profile?.qualification}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Experience</p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">{profile?.experienceYears} Years</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Medical Council Reg Number</p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">{profile?.registrationNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Doctor Code</p>
                      <p className="font-semibold text-primary">{profile?.doctorCode}</p>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <Mail className="h-4 w-4 text-primary" />
                      Contact Details
                    </h4>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Email Address</p>
                        <p className="font-medium">{profile?.email || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Mobile Number</p>
                        <p className="font-medium">{profile?.mobileNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Edit className="h-5 w-5 text-primary" />
                    Modify Profile
                  </CardTitle>
                  <CardDescription>Update your contact and registration profile fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Doctor Name *</label>
                        <Input
                          value={editForm.doctorName}
                          onChange={(e) => setEditForm({ ...editForm, doctorName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Specialization *</label>
                        <Input
                          value={editForm.specialization}
                          onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Qualification *</label>
                        <Input
                          value={editForm.qualification}
                          onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Experience (Years)</label>
                        <Input
                          type="number"
                          value={editForm.experienceYears}
                          onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Registration Number *</label>
                        <Input
                          value={editForm.registrationNumber}
                          onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Mobile Number</label>
                        <Input
                          value={editForm.mobileNumber}
                          onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Email Address</label>
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Signature Image URL</label>
                        <Input
                          placeholder="https://example.com/signature.png"
                          value={editForm.signatureUrl}
                          onChange={(e) => setEditForm({ ...editForm, signatureUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="gap-1.5" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" /> Save Updates
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: Association Info & Digital Signature Preview */}
          <div className="space-y-6">
            {/* Associated Practice info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Clinical Assignment
                </CardTitle>
                <CardDescription>Primary clinical facility linkage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.hospitalName ? (
                  <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 border border-primary/15">
                    <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-bold">
                      Hospital Linkage
                    </Badge>
                    <p className="text-sm font-bold">{profile.hospitalName}</p>
                    {profile.hospitalAddress && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        {profile.hospitalAddress}
                      </p>
                    )}
                  </div>
                ) : null}

                {profile?.clinicName ? (
                  <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 border border-primary/15">
                    <Badge className="bg-blue-500/10 text-blue-700 border-none text-[10px] uppercase font-bold">
                      Clinic Linkage
                    </Badge>
                    <p className="text-sm font-bold">{profile.clinicName}</p>
                    {profile.clinicAddress && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        {profile.clinicAddress}
                      </p>
                    )}
                  </div>
                ) : null}

                {!profile?.hospitalName && !profile?.clinicName ? (
                  <p className="text-xs text-muted-foreground italic">No clinic or hospital associations found.</p>
                ) : null}
              </CardContent>
            </Card>

            {/* Signature Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Digital Signature
                </CardTitle>
                <CardDescription>Appears on PDF prescriptions</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/20">
                {profile?.signatureUrl ? (
                  <div className="space-y-3 text-center">
                    <img
                      src={profile.signatureUrl}
                      alt="Doctor Signature"
                      className="max-h-20 max-w-full object-contain mx-auto border bg-white p-1 rounded"
                      onError={(e) => {
                        (e.target as any).style.display = "none";
                      }}
                    />
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">{profile.signatureUrl}</p>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-muted-foreground">No digital signature uploaded.</p>
                    <p className="text-[10px] text-muted-foreground">Provide a Signature Image URL in edit mode to append it automatically to prescriptions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
