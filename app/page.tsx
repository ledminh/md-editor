"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasPanel } from "@/app/components/CanvasPanel";
import { DynamoControls } from "@/app/components/DynamoControls";
import { DynamoFileList } from "@/app/components/DynamoFileList";
import { StudioHeader } from "@/app/components/StudioHeader";
import { useClipboard } from "@/app/hooks/useClipboard";
import { pageStyle, starterMarkdown } from "@/app/lib/constants";
import {
  fetchDynamoFile,
  listDynamoFiles,
  saveDynamoFile,
} from "@/app/lib/dynamo-client";
import { normalizeFileName } from "@/app/lib/storage-client";
import type { MarkdownFile, ViewMode } from "@/app/lib/types";

export default function Home() {
  const [markdown, setMarkdown] = useState(starterMarkdown);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [swapSides, setSwapSides] = useState(false);
  const [fileName, setFileName] = useState("notes.md");
  const [files, setFiles] = useState<MarkdownFile[]>([]);
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
      const data = await listDynamoFiles();
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
      await saveDynamoFile(normalizedFileName, markdown);
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
    async (file: MarkdownFile) => {
      setStatusMessage(null);
      try {
        const data = await fetchDynamoFile(file.key);
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
            <DynamoControls
              fileName={fileName}
              onFileNameChange={setFileName}
              onSave={handleSave}
              isSaving={isSaving}
            />
            <DynamoFileList
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
