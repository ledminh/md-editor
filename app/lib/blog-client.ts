import type { BlogPostMeta } from "@/app/lib/types";

export const normalizeFileName = (fileName: string) => {
  const trimmed = fileName.trim() || "untitled.md";
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};

export const listBlogPosts = async (tag?: string): Promise<BlogPostMeta[]> => {
  const url = tag ? `/api/posts?tag=${encodeURIComponent(tag)}` : "/api/posts";
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load posts.");
  }
  const data = (await response.json()) as { posts?: BlogPostMeta[] };
  return data.posts ?? [];
};

export const saveBlogPost = async (
  key: string,
  title: string,
  content: string,
  tags: string[]
) => {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, title, content, tags }),
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

export const fetchBlogPost = async (key: string) => {
  const response = await fetch(`/api/posts?key=${encodeURIComponent(key)}`, {
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
  const data = (await response.json()) as {
    key: string;
    title: string;
    content: string;
    tags: string[];
  };
  return data;
};

export const deleteBlogPost = async (key: string) => {
  const response = await fetch(`/api/posts?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    let message = "Delete failed.";
    try {
      const data = (await response.json()) as { error?: string };
      message = data.error || message;
    } catch {
      // Ignore JSON parse errors and fall back to the default message.
    }
    throw new Error(message);
  }
};
