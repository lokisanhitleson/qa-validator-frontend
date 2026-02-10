"use client";

interface SegmentFilterProps {
  segments: string[];
  selectedSegment: string;
  onSegmentChange: (segment: string) => void;
}

export default function SegmentFilter({
  segments,
  selectedSegment,
  onSegmentChange,
}: SegmentFilterProps) {
  return (
    <select
      value={selectedSegment}
      onChange={(e) => onSegmentChange(e.target.value)}
      className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      <option value="All">All Segments</option>
      {segments.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
