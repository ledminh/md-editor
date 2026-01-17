import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export const markdownPlugins = [remarkGfm];

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 text-2xl font-semibold text-zinc-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-xl font-semibold text-zinc-900">
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-sm leading-6 text-zinc-700">{children}</p>
  ),
  li: ({ children }) => (
    <li className="ml-4 list-disc text-sm leading-6 text-zinc-700">
      {children}
    </li>
  ),
  code: ({ children }) => (
    <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-700">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-xs text-zinc-700">
      {children}
    </pre>
  ),
};
