"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasPanel } from "@/app/components/CanvasPanel";
import { S3Controls } from "@/app/components/S3Controls";
import { S3FileList } from "@/app/components/S3FileList";
import { StudioHeader } from "@/app/components/StudioHeader";
import { useClipboard } from "@/app/hooks/useClipboard";
import { pageStyle, starterMarkdown } from "@/app/lib/constants";
import {
  fetchS3File,
  listS3Files,
  normalizeFileName,
  saveS3File,
} from "@/app/lib/s3-client";
import type { S3File, ViewMode } from "@/app/lib/types";

export default function Home() {
  const [markdown, setMarkdown] = useState(starterMarkdown);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [swapSides, setSwapSides] = useState(false);
  const [fileName, setFileName] = useState("notes.md");
  const [files, setFiles] = useState<S3File[]>([]);
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
      const data = await listS3Files();
      setFiles(data);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to load files."
      );
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleCopy = useCallback(() => {
    void copyToClipboard(markdown);
  }, [copyToClipboard, markdown]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveS3File(normalizedFileName, markdown);
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
    async (file: S3File) => {
      setStatusMessage(null);
      try {
        const data = await fetchS3File(file.key);
        setMarkdown(data.content);
        setFileName(data.key);
        setStatusMessage(`Loaded ${data.key}.`);
      } catch (error) {
        setStatusMessage(
          error instanceof Error ? error.message : "Unable to load file."
        );
      }
    },
    []
  );

  return (
    <div
      className="min-h-screen bg-[radial-gradient(70%_120%_at_10%_0%,#ffe8c3_0%,rgba(255,255,255,0)_60%),radial-gradient(80%_100%_at_100%_20%,#d9e9ff_0%,rgba(255,255,255,0)_55%),linear-gradient(160deg,#fffdf8_0%,#f2f7ff_45%,#f9eef9_100%)] text-zinc-900"
      style={pageStyle}
    >
      <main className="mx-auto flex h-screen w-full flex-col px-4 py-4 md:px-8">
        <StudioHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSwapSides={() => setSwapSides((prev) => !prev)}
          onCopy={handleCopy}
        />

        <section className="mt-4 flex min-h-0 flex-1 flex-col gap-6">
          <CanvasPanel
            markdown={markdown}
            onMarkdownChange={setMarkdown}
            viewMode={viewMode}
            swapSides={swapSides}
            normalizedFileName={normalizedFileName}
            copyMessage={copyMessage}
            statusMessage={statusMessage}
          />

          <aside className="grid gap-6 md:grid-cols-2">
            <S3Controls
              fileName={fileName}
              onFileNameChange={setFileName}
              onSave={handleSave}
              isSaving={isSaving}
            />
            <S3FileList
              files={files}
              isLoading={isLoadingFiles}
              onRefresh={loadFiles}
              onSelect={handleSelectFile}
            />
          </aside>
        </section>
      </main>
    </div>
  );
}
