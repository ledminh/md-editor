import type { ViewMode } from "@/app/lib/types";
import { EditorPanel } from "@/app/components/EditorPanel";
import { PreviewPanel } from "@/app/components/PreviewPanel";

type CanvasPanelProps = {
  markdown: string;
  onMarkdownChange: (value: string) => void;
  viewMode: ViewMode;
  swapSides: boolean;
  normalizedFileName: string;
  copyMessage: string | null;
  statusMessage: string | null;
};

export const CanvasPanel = ({
  markdown,
  onMarkdownChange,
  viewMode,
  swapSides,
  normalizedFileName,
  copyMessage,
  statusMessage,
}: CanvasPanelProps) => {
  const editorVisible = viewMode !== "preview";
  const previewVisible = viewMode !== "editor";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_30px_90px_-60px_rgba(31,41,55,0.6)] backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
        <span>Canvas</span>
        <div className="flex items-center gap-4">
          {copyMessage && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] tracking-[0.2em] text-zinc-500">
              {copyMessage}
            </span>
          )}
          {statusMessage && (
            <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] tracking-[0.2em] text-orange-600">
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      <div
        className={`grid min-h-0 flex-1 gap-4 grid-cols-1 ${
          viewMode === "split" ? "md:grid-cols-2" : "md:grid-cols-1"
        }`}
      >
        {editorVisible && (
          <EditorPanel
            value={markdown}
            onChange={onMarkdownChange}
            fileName={normalizedFileName}
            swapSides={swapSides}
          />
        )}
        {previewVisible && (
          <PreviewPanel value={markdown} swapSides={swapSides} />
        )}
      </div>
    </div>
  );
};
