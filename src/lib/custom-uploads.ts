import { supabase } from "@/integrations/supabase/client";
import type { CartAttachment } from "@/lib/cart";

export const MAX_FILE_MB = 30;
export const MAX_FILES = 8;

export const ACCEPT_ATTR =
  "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/svg+xml,application/pdf,application/postscript,.ai,.eps,.heic,.heif";

const ALLOWED_EXT = [
  "jpg", "jpeg", "png", "webp", "heic", "heif", "svg", "pdf", "ai", "eps",
];

export type UploadItem = {
  id: string;
  file: File;
  previewUrl: string | null;
  progress: number;      // 0..100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  path?: string;         // storage path when done
};

export function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) return `סוג קובץ לא נתמך: .${ext}`;
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `הקובץ גדול מ־${MAX_FILE_MB}MB`;
  if (file.size === 0) return "קובץ ריק";
  return null;
}

export function isImage(file: File): boolean {
  return file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|heic|heif|svg)$/i.test(file.name);
}

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
}

/** Uploads a single file to the custom-uploads bucket under a session folder. */
export async function uploadCustomFile(
  sessionId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${sessionId}/${ts}-${rand}-${safeName(file.name)}`;

  // supabase-js v2 doesn't expose upload progress; simulate two steps.
  onProgress?.(10);
  const { error } = await supabase.storage
    .from("custom-uploads")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) throw error;
  onProgress?.(100);
  return path;
}

export function toAttachments(items: UploadItem[]): CartAttachment[] {
  return items
    .filter((i) => i.status === "done" && i.path)
    .map((i) => ({
      path: i.path!,
      name: i.file.name,
      size: i.file.size,
      type: i.file.type,
    }));
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
