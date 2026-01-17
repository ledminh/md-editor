"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const useClipboard = (timeoutMs = 2000) => {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const copyToClipboard = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopyMessage("Copied to clipboard.");
      } catch {
        setCopyMessage("Clipboard copy failed.");
      }
      clearTimer();
      timeoutRef.current = window.setTimeout(
        () => setCopyMessage(null),
        timeoutMs
      );
    },
    [timeoutMs]
  );

  return { copyMessage, copyToClipboard };
};
