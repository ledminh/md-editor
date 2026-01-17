type EditorPanelProps = {
  value: string;
  onChange: (value: string) => void;
  fileName: string;
  swapSides: boolean;
};

export const EditorPanel = ({
  value,
  onChange,
  fileName,
  swapSides,
}: EditorPanelProps) => (
  <section
    className={`flex min-h-0 flex-col rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm ${
      swapSides ? "md:order-2" : "md:order-1"
    }`}
  >
    <header className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
      Editor
      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] tracking-[0.2em] text-zinc-400">
        {fileName}
      </span>
    </header>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-full min-h-0 flex-1 resize-none rounded-xl border border-zinc-100 bg-[var(--panel-muted)] p-4 text-sm leading-6 text-zinc-700 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-orange-100"
      placeholder="Write markdown here..."
    />
  </section>
);
