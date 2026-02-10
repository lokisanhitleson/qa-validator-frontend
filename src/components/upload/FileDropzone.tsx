"use client";

import { useCallback, useRef, useState } from "react";
import { SelectedFile } from "@/interfaces";
import { validateFileExtension } from "@/utils/file-validation";
import { ALLOWED_FILE_EXTENSIONS } from "@/utils/constants";

interface FileDropzoneProps {
  onFilesAdded: (files: SelectedFile[]) => void;
  disabled?: boolean;
}

export default function FileDropzone({
  onFilesAdded,
  disabled,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const selected: SelectedFile[] = Array.from(fileList).map((file) => {
        const isValid = validateFileExtension(file.name);
        return {
          file,
          isValid,
          error: isValid
            ? undefined
            : `Unsupported file type. Allowed: ${ALLOWED_FILE_EXTENSIONS.join(", ")}`,
        };
      });
      onFilesAdded(selected);
    },
    [onFilesAdded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
          : isDragOver
            ? "border-primary bg-primary/5"
            : "border-card-border bg-card-bg hover:border-primary/50 hover:bg-primary/5"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`mb-4 ${isDragOver ? "text-primary" : "text-muted"}`}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="mb-1 text-sm font-medium text-foreground">
        {isDragOver ? "Drop files here" : "Drag & drop files here"}
      </p>
      <p className="text-xs text-muted">
        or click to browse — {ALLOWED_FILE_EXTENSIONS.join(", ")}
      </p>
    </div>
  );
}
