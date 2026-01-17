import type { S3File } from "@/app/lib/types";

export const normalizeFileName = (fileName: string) => {
  const trimmed = fileName.trim() || "untitled.md";
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};

export const listS3Files = async (): Promise<S3File[]> => {
  const response = await fetch("/api/s3", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load files.");
  }
  const data = (await response.json()) as { files?: S3File[] };
  return data.files ?? [];
};

export const saveS3File = async (key: string, content: string) => {
  const response = await fetch("/api/s3", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, content }),
  });

  if (!response.ok) {
    let message = "Save failed.";
    try {
      const data = (await response.json()) as { error?: string };
      message = data.error || message;
    } catch {
      // Ignore JSON parse errors and fall back to the default message.
    }
    throw new Error(message);
  }
};
