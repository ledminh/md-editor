import type { ViewMode } from "@/app/lib/types";

type StudioHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSwapSides: () => void;
  onCopy: () => void;
};

const viewModes: ViewMode[] = ["split", "editor", "preview"];

export const StudioHeader = ({
  viewMode,
  onViewModeChange,
  onSwapSides,
  onCopy,
}: StudioHeaderProps) => (
  <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_20px_60px_-45px_rgba(31,41,55,0.5)] backdrop-blur md:flex-row md:items-center md:justify-between">
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
        Atlas Markdown Studio
      </p>
      <h1 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
        Write with clarity, preview with punch.
      </h1>
      <p className="max-w-xl text-sm text-zinc-600">
        Switch layouts, expand panels, and send clean markdown straight to your
        Postgres database.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-full bg-[var(--panel-muted)] p-1 text-xs font-medium uppercase tracking-widest text-zinc-600">
        {viewModes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            className={`rounded-full px-3 py-2 transition ${
              viewMode === mode
                ? "bg-[var(--panel)] text-[var(--ink)] shadow"
                : "hover:text-[var(--ink)]"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSwapSides}
        className="rounded-full border border-transparent bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 shadow-sm transition hover:border-zinc-200"
      >
        Swap sides
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="rounded-full border border-transparent bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-orange-200 transition hover:bg-[var(--accent-strong)]"
      >
        Copy markdown
      </button>
    </div>
  </header>
);
