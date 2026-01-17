import ReactMarkdown from "react-markdown";
import { markdownComponents, markdownPlugins } from "@/app/lib/markdown";

type PreviewPanelProps = {
  value: string;
  swapSides: boolean;
};

export const PreviewPanel = ({ value, swapSides }: PreviewPanelProps) => (
  <section
    className={`flex min-h-0 flex-col rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm ${
      swapSides ? "md:order-1" : "md:order-2"
    }`}
  >
    <header className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
      Preview
      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] tracking-[0.2em] text-zinc-400">
        live
      </span>
    </header>
    <div className="h-full min-h-0 flex-1 overflow-y-auto rounded-xl border border-zinc-100 bg-white p-4 text-sm leading-6 text-zinc-700">
      <ReactMarkdown
        remarkPlugins={markdownPlugins}
        components={markdownComponents}
      >
        {value}
      </ReactMarkdown>
    </div>
  </section>
);
