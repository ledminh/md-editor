import type { S3File } from "@/app/lib/types";
import { formatDate, formatFileSize } from "@/app/lib/format";

type S3FileListProps = {
  files: S3File[];
  isLoading: boolean;
  onRefresh: () => void;
};

export const S3FileList = ({ files, isLoading, onRefresh }: S3FileListProps) => (
  <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-45px_rgba(31,41,55,0.5)] backdrop-blur">
    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
      <span>S3 Files</span>
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-full border border-zinc-200 px-3 py-1 text-[10px] tracking-[0.25em] text-zinc-500 transition hover:border-zinc-300"
      >
        Refresh
      </button>
    </div>
    <div className="mt-4 space-y-3 text-sm text-zinc-600">
      {isLoading && <p>Loading files...</p>}
      {!isLoading && files.length === 0 && <p>No markdown files found.</p>}
      {files.map((file) => (
        <div
          key={file.key}
          className="rounded-2xl border border-zinc-100 bg-white px-3 py-2"
        >
          <p className="text-xs font-semibold text-zinc-700">{file.key}</p>
          <p className="text-[11px] text-zinc-400">
            {formatDate(file.lastModified)} - {formatFileSize(file.size)}
          </p>
        </div>
      ))}
    </div>
  </div>
);
