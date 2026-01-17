export type ViewMode = "split" | "editor" | "preview";

export type S3File = {
  key: string;
  size: number;
  lastModified: string | null;
};
