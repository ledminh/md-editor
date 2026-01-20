export type ViewMode = "split" | "editor" | "preview";

export type BlogPostMeta = {
  key: string;
  title: string;
  size: number;
  lastModified: string | null;
  tags: string[];
};
