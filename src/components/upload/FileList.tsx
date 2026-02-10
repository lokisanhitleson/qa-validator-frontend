"use client";

import { SelectedFile } from "@/interfaces";

interface FileListProps {
  files: SelectedFile[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function FileList({ files, onRemove, disabled }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        Selected Files ({files.length})
      </p>
      <ul className="space-y-2">
        {files.map((selectedFile, index) => (
          <li
            key={`${selectedFile.file.name}-${index}`}
            className="flex items-center justify-between rounded-lg border border-card-border bg-card-bg px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {selectedFile.isValid ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="flex-shrink-0 text-green-500"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="flex-shrink-0 text-red-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">
                  {selectedFile.file.name}
                </p>
                {selectedFile.error && (
                  <p className="text-xs text-red-500">{selectedFile.error}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(index)}
              disabled={disabled}
              className="ml-3 flex-shrink-0 rounded p-1 text-muted hover:bg-gray-100 hover:text-foreground disabled:opacity-50"
              title="Remove file"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
