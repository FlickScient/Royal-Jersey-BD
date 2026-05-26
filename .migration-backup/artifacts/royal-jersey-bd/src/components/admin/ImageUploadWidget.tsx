import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadWidgetProps {
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  height?: string;
}

export default function ImageUploadWidget({ value, onChange, onUploadingChange, label, height = "h-36" }: ImageUploadWidgetProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokePreview();
  }, [revokePreview]);

  const setUploading_ = useCallback((val: boolean) => {
    setUploading(val);
    onUploadingChange?.(val);
  }, [onUploadingChange]);

  const uploadFile = useCallback(async (file: File) => {
    revokePreview();
    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setLocalPreview(preview);
    setUploading_(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
      revokePreview();
      setLocalPreview(null);
    } catch {
      revokePreview();
      setLocalPreview(null);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading_(false);
    }
  }, [onChange, onUploadingChange, revokePreview, setUploading_]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const displayUrl = localPreview || value;

  const handleClear = () => {
    revokePreview();
    setLocalPreview(null);
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      {displayUrl ? (
        <div className={`relative w-full ${height} rounded-lg overflow-hidden bg-muted border border-border/20`}>
          <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors group flex items-center justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium"
            >
              Change Image
            </button>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!uploading && value && !localPreview && (
            <div className="absolute bottom-2 left-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Uploaded</div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={uploading}
          className={`w-full ${height} rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground ${
            dragOver
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/30 bg-background hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          }`}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <div className="text-center">
                <p className="text-xs font-medium">Click or drag & drop</p>
                <p className="text-xs opacity-60 mt-0.5">JPG, PNG, WebP up to 10MB</p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
}
