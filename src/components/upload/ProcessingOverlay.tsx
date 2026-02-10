"use client";

import { ProcessingStage } from "@/interfaces";
import ProgressBar from "@/components/ui/ProgressBar";

interface ProcessingOverlayProps {
  progress: number;
  stages: ProcessingStage[];
}

export default function ProcessingOverlay({
  progress,
  stages,
}: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-2 text-center text-lg font-bold text-foreground">
          Processing Documents
        </h2>
        <p className="mb-6 text-center text-sm text-muted">
          Analyzing your files with AI...
        </p>

        <div className="mb-2">
          <ProgressBar progress={progress} />
        </div>
        <p className="mb-6 text-right text-xs text-muted">
          {Math.round(progress)}%
        </p>

        <ul className="space-y-3">
          {stages.map((stage, index) => (
            <li key={index} className="flex items-center gap-3">
              {stage.status === "completed" ? (
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
              ) : stage.status === "active" ? (
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                </div>
              )}
              <span
                className={`text-sm ${
                  stage.status === "completed"
                    ? "text-foreground"
                    : stage.status === "active"
                      ? "font-medium text-primary"
                      : "text-muted"
                }`}
              >
                {stage.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
