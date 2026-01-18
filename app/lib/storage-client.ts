export const normalizeFileName = (fileName: string) => {
  const trimmed = fileName.trim() || "untitled.md";
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};
