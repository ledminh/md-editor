import type { BlogPostMeta } from "@/app/lib/types";
import { formatDate, formatFileSize } from "@/app/lib/format";

type BlogFileListProps = {
  files: BlogPostMeta[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelect: (file: BlogPostMeta) => void;
  onDelete: (file: BlogPostMeta) => void;
};

export const BlogFileList = ({
  files,
  isLoading,
  onRefresh,
  onSelect,
  onDelete,
}: BlogFileListProps) => (
  <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-45px_rgba(31,41,55,0.5)] backdrop-blur">
    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
      <span>Blog posts</span>
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
          <button
            type="button"
            onClick={() => onSelect(file)}
            className="w-full text-left"
          >
            <p className="text-xs font-semibold text-zinc-700">{file.title}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              {file.key}
            </p>
            <p className="text-[11px] text-zinc-400">
              {formatDate(file.lastModified)} - {formatFileSize(file.size)}
            </p>
            {file.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {file.tags.map((tag) => (
                  <span
                    key={`${file.key}-${tag}`}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => onDelete(file)}
              className="rounded-full border border-zinc-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
