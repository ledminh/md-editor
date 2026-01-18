import type { MarkdownFile } from "@/app/lib/types";

export const normalizeFileName = (fileName: string) => {
  const trimmed = fileName.trim() || "untitled.md";
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};

export const listPostgresFiles = async (): Promise<MarkdownFile[]> => {
  const response = await fetch("/api/postgres", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load files.");
  }
  const data = (await response.json()) as { files?: MarkdownFile[] };
  return data.files ?? [];
};

export const savePostgresFile = async (key: string, content: string) => {
  const response = await fetch("/api/postgres", {
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

export const fetchPostgresFile = async (key: string) => {
  const response = await fetch(`/api/postgres?key=${encodeURIComponent(key)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    let message = "Load failed.";
    try {
      const data = (await response.json()) as { error?: string };
      message = data.error || message;
    } catch {
      // Ignore JSON parse errors and fall back to the default message.
    }
    throw new Error(message);
  }
  const data = (await response.json()) as { key: string; content: string };
  return data;
};
