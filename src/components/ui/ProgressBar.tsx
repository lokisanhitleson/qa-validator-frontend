"use client";

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
