export const formatFileSize = (bytes: number) =>
  `${(bytes / 1024).toFixed(1)} KB`;

export const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "Unknown date";
