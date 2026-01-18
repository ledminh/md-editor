export type ViewMode = "split" | "editor" | "preview";

export type MarkdownFile = {
  key: string;
  size: number;
  lastModified: string | null;
};
