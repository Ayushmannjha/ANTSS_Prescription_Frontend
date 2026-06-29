"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Eye,
  FileText,
  Plus,
  Trash2,
  Upload,
  Loader2,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { PatientData, DocumentEntry } from "./types";
import { uploadPatientDocument } from "@/lib/services/documentService";

type Props = {
  data: PatientData;
  addDocument: () => void;
  addDocumentWithValues: (fileName: string, url: string) => void;
  removeDocument: (id: string) => void;
  updateDocument: (
    id: string,
    field: keyof Omit<DocumentEntry, "id">,
    value: string
  ) => void;
  isHighlighted?: (field: string) => boolean;
  previewOpen?: boolean;
  onPreviewOpenChange?: (open: boolean) => void;
};

export default function DocumentsPage({
  data,
  addDocument,
  addDocumentWithValues,
  removeDocument,
  updateDocument,
  isHighlighted = () => false,
  previewOpen,
  onPreviewOpenChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const previewDocuments = useMemo(
    () => (data.documents || []).filter((doc) => doc.url),
    [data.documents]
  );
  const selectedDocument =
    previewDocuments.find((doc) => doc.id === selectedDocumentId) ||
    previewDocuments[0] ||
    null;
  const isPreviewOpen = previewOpen ?? internalPreviewOpen;

  const setPreviewOpen = (open: boolean) => {
    onPreviewOpenChange?.(open);
    if (previewOpen === undefined) {
      setInternalPreviewOpen(open);
    }
  };

  const openDocumentPreview = (doc?: DocumentEntry) => {
    setSelectedDocumentId(doc?.id || previewDocuments[0]?.id || null);
    setPreviewOpen(true);
  };

  const isImageDocument = (doc: DocumentEntry) => {
    const source = `${doc.fileName || ""} ${doc.url || ""}`.toLowerCase();
    return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(source);
  };

  const handleCentralFileUpload = async (file: File) => {
    const patientId = data.patientId;

    if (!patientId) {
      alert("Please save the patient first before uploading documents.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadPatientDocument(patientId, file, "DOCUMENT");
      addDocumentWithValues(file.name, result.url);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Documents</span>
          </CardTitle>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCentralFileUpload(file);
              }}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-full px-2 text-[11px] bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              <span className="truncate">
                {uploading ? "Uploading..." : "Upload"}
              </span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-full px-2 text-[11px] bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              onClick={() => openDocumentPreview()}
              disabled={previewDocuments.length === 0}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              <span className="truncate">Preview</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-full px-2 text-[11px] bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              onClick={addDocument}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span className="truncate">Add</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div
          className="mb-3 cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/30 bg-card/20 px-3 py-4 text-center transition-colors hover:bg-card/40"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            Click or drag files here to upload
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/60">
            PDF, JPG, PNG, DOC — max 10MB
          </p>
        </div>

        {(data.documents?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 px-2 py-2 text-center text-xs text-muted-foreground">
            No documents yet. Upload files above or click Add.
          </div>
        ) : (
          <div className="w-full">
            <div className="hidden lg:grid grid-cols-[40px_1fr_1.5fr_32px] items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <div>#</div>
              <div>File Name</div>
              <div>URL</div>
              <div />
            </div>

            <div className="space-y-4 pt-1 lg:space-y-2">
              {(data.documents || []).map((doc, index) => (
                <div
                  key={doc.id}
                  className="relative grid grid-cols-1 items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 lg:grid-cols-[40px_1fr_1.5fr_32px] lg:gap-2 lg:border-none lg:bg-transparent lg:p-0 lg:px-2"
                >
                  <div className="hidden pt-2 text-center text-[11px] font-medium text-slate-400 lg:block">
                    {index + 1}
                  </div>

                  <div className="mb-1 flex items-center gap-2 lg:hidden">
                    <span className="text-xs font-semibold text-slate-700">
                      Document #{index + 1}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 lg:block">
                    <label className="text-[10px] font-semibold uppercase text-slate-500 lg:hidden">
                      File Name
                    </label>

                    <Input
                      value={doc.fileName}
                      onChange={(e) =>
                        updateDocument(doc.id, "fileName", e.target.value)
                      }
                      placeholder="e.g., Lab Report"
                      className={`h-8 bg-slate-50 text-sm border-slate-200 focus-visible:ring-sky-500 lg:text-xs ${
                        isHighlighted("documents")
                          ? "ring-2 ring-sky-500 bg-sky-50"
                          : ""
                      }`}
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-1 lg:block">
                    <label className="text-[10px] font-semibold uppercase text-slate-500 lg:hidden">
                      URL
                    </label>

                    {doc.url ? (
                      <div className="flex h-8 w-full min-w-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 lg:border-none lg:bg-transparent lg:px-0">
                        <CheckCircle className="h-3 w-3 shrink-0 text-green-600" />

                        <button
                          type="button"
                          onClick={() => openDocumentPreview(doc)}
                          className="min-w-0 flex-1 truncate text-left text-[10px] text-muted-foreground transition-colors hover:text-primary hover:underline"
                          title="Preview document"
                        >
                          {doc.url}
                        </button>

                        <button
                          type="button"
                          onClick={() => openDocumentPreview(doc)}
                          className="shrink-0 text-primary"
                          title="Preview document"
                        >
                          <Eye className="h-3 w-3" />
                        </button>

                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex h-8 w-full min-w-0 items-center rounded-md border border-slate-200 bg-slate-50 px-2 lg:border-none lg:bg-transparent lg:px-0">
                        <span className="min-w-0 flex-1 truncate text-[10px] italic text-muted-foreground">
                          Upload a document...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="absolute right-2 top-2 z-10 lg:static lg:flex lg:justify-end lg:pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[94vh] max-h-[94vh] !w-[calc(100vw-3rem)] !max-w-[1200px] flex-col gap-0 overflow-hidden border-slate-200 bg-slate-100 p-0">
          <DialogHeader className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 pr-14">
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <FileText className="h-4 w-4 text-blue-600" />
              Document preview
            </DialogTitle>

            <DialogDescription className="text-xs">
              {previewDocuments.length > 0
                ? `${previewDocuments.length} document${previewDocuments.length === 1 ? "" : "s"} available`
                : "No uploaded documents available"}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument ? (
            <div className="grid min-h-0 flex-1 grid-cols-1 bg-slate-100 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white p-3 lg:border-b-0 lg:border-r">
                <div className="space-y-2">
                  {previewDocuments.map((doc, index) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
                      className={`flex w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                        selectedDocument.id === doc.id
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">
                          {doc.fileName || `Document ${index + 1}`}
                        </span>
                        <span className="block truncate text-[10px] text-slate-400">
                          {doc.url}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="flex min-h-0 flex-col">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
                  <p className="min-w-0 truncate text-xs font-semibold text-slate-700">
                    {selectedDocument.fileName || "Selected document"}
                  </p>

                  <a
                    href={selectedDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open
                  </a>
                </div>

                <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
                  {isImageDocument(selectedDocument) ? (
                    <div className="flex min-h-full items-center justify-center">
                      <img
                        key={selectedDocument.id}
                        src={selectedDocument.url}
                        alt={selectedDocument.fileName || "Document preview"}
                        className="max-h-full max-w-full object-contain shadow-sm"
                      />
                    </div>
                  ) : (
                    <iframe
                      key={selectedDocument.id}
                      src={selectedDocument.url}
                      title={selectedDocument.fileName || "Document preview"}
                      className="h-full min-h-[640px] w-full border-0 bg-white"
                    />
                  )}
                </div>
              </main>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              Upload a document first to preview it here.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
