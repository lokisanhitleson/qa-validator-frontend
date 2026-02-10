"use client";

import { useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { SelectedFile, ProcessingStage } from "@/interfaces";
import { useProjectData } from "@/context/ProjectDataContext";
import { simulateProcessing } from "@/services/upload.service";
import FileDropzone from "@/components/upload/FileDropzone";
import FileList from "@/components/upload/FileList";
import ProcessingOverlay from "@/components/upload/ProcessingOverlay";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function UploadPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { addSegmentData, uploadCount, segments } = useProjectData();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [segmentName, setSegmentName] = useState("");
  const [segmentTouched, setSegmentTouched] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stages, setStages] = useState<ProcessingStage[]>([]);

  const handleFilesAdded = useCallback((newFiles: SelectedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const trimmedSegment = segmentName.trim();
  const segmentError = segmentTouched
    ? trimmedSegment.length === 0
      ? "Segment name is required"
      : trimmedSegment.length < 2
        ? "Segment name must be at least 2 characters"
        : trimmedSegment.length > 100
          ? "Segment name must be no more than 100 characters"
          : segments.includes(trimmedSegment)
            ? "A segment with this name already exists"
            : undefined
    : undefined;

  const hasFiles = files.length > 0;
  const allValid = hasFiles && files.every((f) => f.isValid);
  const canUpload =
    allValid &&
    trimmedSegment.length >= 2 &&
    trimmedSegment.length <= 100 &&
    !segments.includes(trimmedSegment);

  const handleUpload = () => {
    if (!canUpload) return;
    setIsProcessing(true);
    setProgress(0);

    const trimmedName = segmentName.trim();

    simulateProcessing(trimmedName, uploadCount + 1, {
      onProgress: setProgress,
      onStageUpdate: setStages,
      onComplete: (data) => {
        addSegmentData(data, trimmedName);
        router.push(`/projects/${projectId}/requirements`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Upload Project Documents
        </h1>
        <p className="mt-1 text-sm text-muted">
          Upload your project documents to extract requirements, generate test
          cases, and build a traceability matrix.
        </p>
      </div>

      <FileDropzone onFilesAdded={handleFilesAdded} disabled={isProcessing} />

      <FileList
        files={files}
        onRemove={handleRemoveFile}
        disabled={isProcessing}
      />

      {hasFiles && (
        <div className="rounded-xl border border-card-border bg-card-bg p-6 space-y-4">
          <Input
            label="Segment Name"
            id="segment-name"
            placeholder="e.g., Payment Module, Auth Feature"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            onBlur={() => setSegmentTouched(true)}
            disabled={isProcessing}
            error={segmentError}
          />
          <p className="text-xs text-muted">
            A label to group requirements and test cases from this upload
          </p>
        </div>
      )}

      {hasFiles && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!canUpload || isProcessing}
          >
            Upload &amp; Continue
          </Button>
        </div>
      )}

      {isProcessing && (
        <ProcessingOverlay progress={progress} stages={stages} />
      )}
    </div>
  );
}
