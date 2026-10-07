import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileImage, RefreshCw, ScanLine, UploadCloud, X } from "lucide-react";

import AppLayout from "../components/AppLayout";
import { Alert, Button, Card, Spinner } from "../components/ui";
import billService from "../services/billService";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 10;

const formatSize = (bytes) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const ScanBill = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectFile = useCallback((candidate) => {
    setError("");
    if (!candidate) return;

    if (!ACCEPTED.includes(candidate.type)) {
      setError("Unsupported file type. Please upload a JPG, PNG or WebP image.");
      return;
    }
    if (candidate.size > MAX_MB * 1024 * 1024) {
      setError(`That image is too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }
    setFile(candidate);
  }, []);

  const clearFile = () => {
    setFile(null);
    setPreviewUrl("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (loading) return;
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please select a bill image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await billService.uploadBill(file);
      navigate("/review-bill", { state: { bill: data.bill } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.request
            ? "Can't reach the server. Check your connection and try again."
            : "We couldn't scan that bill. Try a clearer photo."),
      );
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Scan bill"
      subtitle="Upload a receipt and Spendora will extract the details for you."
      maxWidth="max-w-3xl"
    >
      <Card className="p-5 sm:p-8">
        <div className="space-y-5">
          {error && (
            <Alert
              type="error"
              onClose={() => setError("")}
              action={
                file && !loading ? (
                  <button onClick={handleScan} className="shrink-0 font-medium underline">
                    Try again
                  </button>
                ) : null
              }
            >
              {error}
            </Alert>
          )}

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition ${
                dragging
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-300 bg-slate-50/60 hover:border-slate-400"
              }`}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <UploadCloud size={26} />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Drag and drop your bill here
              </p>
              <p className="mt-1 text-sm text-slate-500">or</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => inputRef.current?.click()}
              >
                <FileImage size={16} />
                Choose image
              </Button>
              <p className="mt-4 text-xs text-slate-400">
                JPG, PNG or WebP · up to {MAX_MB} MB
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="relative flex max-h-[420px] justify-center bg-slate-100">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Selected bill preview"
                    className="max-h-[420px] w-auto object-contain"
                  />
                )}

                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-[1px]">
                    <Spinner className="h-8 w-8 text-brand-600" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900">
                        Scanning your bill...
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        This can take up to a few seconds.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={clearFile}
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <X size={15} />
                  Remove
                </button>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => selectFile(e.target.files?.[0])}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {file && (
              <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={loading}>
                <RefreshCw size={16} />
                Change image
              </Button>
            )}
            <Button onClick={handleScan} loading={loading} disabled={!file}>
              {!loading && <ScanLine size={16} />}
              {loading ? "Scanning..." : "Scan bill"}
            </Button>
          </div>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-slate-400">
        Tip: a flat, well-lit photo with the whole receipt in frame gives the best results.
      </p>
    </AppLayout>
  );
};

export default ScanBill;
