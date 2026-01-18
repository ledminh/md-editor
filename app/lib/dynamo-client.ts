import type { MarkdownFile } from "@/app/lib/types";

export const listDynamoFiles = async (): Promise<MarkdownFile[]> => {
  const response = await fetch("/api/dynamo", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load files.");
  }
  const data = (await response.json()) as { files?: MarkdownFile[] };
  return data.files ?? [];
};

export const saveDynamoFile = async (key: string, content: string) => {
  const response = await fetch("/api/dynamo", {
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

export const fetchDynamoFile = async (key: string) => {
  const response = await fetch(`/api/dynamo?key=${encodeURIComponent(key)}`, {
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
