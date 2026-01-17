type S3ControlsProps = {
  fileName: string;
  onFileNameChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

export const S3Controls = ({
  fileName,
  onFileNameChange,
  onSave,
  isSaving,
}: S3ControlsProps) => (
  <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-45px_rgba(31,41,55,0.5)] backdrop-blur">
    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
      Save to S3
    </h2>
    <label className="mt-4 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
      File name
    </label>
    <input
      value={fileName}
      onChange={(event) => onFileNameChange(event.target.value)}
      className="mt-2 w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-orange-100"
      placeholder="notes.md"
    />
    <button
      type="button"
      onClick={onSave}
      disabled={isSaving}
      className="mt-4 w-full rounded-full bg-[var(--ink)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-400"
    >
      {isSaving ? "Saving..." : "Save markdown"}
    </button>
  </div>
);
