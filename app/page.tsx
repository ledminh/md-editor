"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BlogControls } from "@/app/components/BlogControls";
import { BlogFileList } from "@/app/components/BlogFileList";
import { CanvasPanel } from "@/app/components/CanvasPanel";
import { StudioHeader } from "@/app/components/StudioHeader";
import { useClipboard } from "@/app/hooks/useClipboard";
import { pageStyle, starterMarkdown } from "@/app/lib/constants";
import {
  deleteBlogPost,
  fetchBlogPost,
  listBlogPosts,
  normalizeFileName,
  saveBlogPost,
} from "@/app/lib/blog-client";
import type { BlogPostMeta, ViewMode } from "@/app/lib/types";

export default function Home() {
  const [markdown, setMarkdown] = useState(starterMarkdown);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [swapSides, setSwapSides] = useState(false);
  const [fileName, setFileName] = useState("notes.md");
  const [title, setTitle] = useState("Untitled post");
  const [tagsInput, setTagsInput] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [files, setFiles] = useState<BlogPostMeta[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { copyMessage, copyToClipboard } = useClipboard();

  const normalizedFileName = useMemo(
    () => normalizeFileName(fileName),
    [fileName]
  );

  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const data = await listBlogPosts(tagFilter.trim() || undefined);
      setFiles(data);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to load files."
      );
    } finally {
      setIsLoadingFiles(false);
    }
  }, [tagFilter]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleCopy = useCallback(() => {
    void copyToClipboard(markdown);
  }, [copyToClipboard, markdown]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    try {
      await saveBlogPost(normalizedFileName, title, markdown, tags);
      setStatusMessage(`Saved ${normalizedFileName}.`);
      await loadFiles();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to save file."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectFile = useCallback(
    async (file: BlogPostMeta) => {
      setStatusMessage(null);
      try {
        const data = await fetchBlogPost(file.key);
        setMarkdown(data.content);
        setFileName(data.key);
        setTitle(data.title || "Untitled post");
        setTagsInput((data.tags ?? []).join(", "));
        setStatusMessage(`Loaded ${data.key}.`);
      } catch (error) {
        setStatusMessage(
          error instanceof Error ? error.message : "Unable to load file."
        );
      }
    },
    []
  );

  const handleDeleteFile = useCallback(
    async (file: BlogPostMeta) => {
      const shouldDelete = window.confirm(
        `Delete "${file.title}"? This cannot be undone.`
      );
      if (!shouldDelete) {
        return;
      }
      setStatusMessage(null);
      try {
        await deleteBlogPost(file.key);
        setStatusMessage(`Deleted ${file.title}.`);
        await loadFiles();
      } catch (error) {
        setStatusMessage(
          error instanceof Error ? error.message : "Unable to delete post."
        );
      }
    },
    [loadFiles]
  );

  return (
    <div
      className="min-h-screen bg-[radial-gradient(70%_120%_at_10%_0%,#ffe8c3_0%,rgba(255,255,255,0)_60%),radial-gradient(80%_100%_at_100%_20%,#d9e9ff_0%,rgba(255,255,255,0)_55%),linear-gradient(160deg,#fffdf8_0%,#f2f7ff_45%,#f9eef9_100%)] text-zinc-900"
      style={pageStyle}
    >
      <main className="mx-auto flex h-screen w-full flex-col px-4 py-3 md:px-8">
        <StudioHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSwapSides={() => setSwapSides((prev) => !prev)}
          onCopy={handleCopy}
          onNewPost={() => {
            setMarkdown(starterMarkdown);
            setFileName("notes.md");
            setTitle("Untitled post");
            setTagsInput("");
            setStatusMessage("Ready for a new post.");
          }}
        />

        <section className="mt-3 flex min-h-0 flex-1 flex-col gap-4">
          <CanvasPanel
            markdown={markdown}
            onMarkdownChange={setMarkdown}
            viewMode={viewMode}
            swapSides={swapSides}
            normalizedFileName={normalizedFileName}
            copyMessage={copyMessage}
            statusMessage={statusMessage}
          />

          <aside className="grid max-h-[260px] gap-4 overflow-y-auto md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <BlogControls
                fileName={fileName}
                onFileNameChange={setFileName}
                title={title}
                onTitleChange={setTitle}
                tags={tagsInput}
                onTagsChange={setTagsInput}
                onSave={handleSave}
                isSaving={isSaving}
                onNewPost={() => {
                  setMarkdown(starterMarkdown);
                  setFileName("notes.md");
                  setTitle("Untitled post");
                  setTagsInput("");
                  setStatusMessage("Ready for a new post.");
                }}
              />
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-45px_rgba(31,41,55,0.5)] backdrop-blur">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  <span>Tag filter</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTagFilter("");
                    }}
                    className="rounded-full border border-zinc-200 px-3 py-1 text-[10px] tracking-[0.25em] text-zinc-500 transition hover:border-zinc-300"
                  >
                    Clear
                  </button>
                </div>
                <input
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value)}
                  className="mt-4 w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-orange-100"
                  placeholder="Filter by tag"
                />
              </div>
            </div>
            <BlogFileList
              files={files}
              isLoading={isLoadingFiles}
              onRefresh={loadFiles}
              onSelect={handleSelectFile}
              onDelete={handleDeleteFile}
            />
          </aside>
        </section>
      </main>
    </div>
  );
}
