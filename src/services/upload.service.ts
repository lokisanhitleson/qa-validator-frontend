import { ProjectData, ProcessingStage } from "@/interfaces";
import { PROCESSING_STAGES } from "@/utils/constants";
import mockRequirements from "@/data/mock-requirements.json";
import mockTestCases from "@/data/mock-test-cases.json";
import mockTraceability from "@/data/mock-traceability.json";

interface ProcessingCallbacks {
  onProgress: (progress: number) => void;
  onStageUpdate: (stages: ProcessingStage[]) => void;
  onComplete: (data: ProjectData) => void;
}

function generatePrefix(name: string, uploadCount: number): string {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return `${initials}${uploadCount}_`;
}

export function simulateProcessing(
  segmentName: string,
  uploadCount: number,
  callbacks: ProcessingCallbacks
): () => void {
  const stages: ProcessingStage[] = PROCESSING_STAGES.map((s) => ({
    ...s,
    status: "pending" as const,
  }));
  let currentStageIndex = 0;
  let overallProgress = 0;
  let cancelled = false;

  const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);

  function processStage() {
    if (cancelled || currentStageIndex >= stages.length) return;

    // Mark current stage as active
    stages[currentStageIndex] = { ...stages[currentStageIndex], status: "active" };
    callbacks.onStageUpdate([...stages]);

    const stage = stages[currentStageIndex];
    const stageProgressStart = overallProgress;
    const stageProgressEnd =
      stageProgressStart + (stage.duration / totalDuration) * 100;
    const steps = stage.duration / 100;
    let stepCount = 0;

    const interval = setInterval(() => {
      if (cancelled) {
        clearInterval(interval);
        return;
      }

      stepCount++;
      const stageProgress = stepCount / steps;
      overallProgress =
        stageProgressStart +
        (stageProgressEnd - stageProgressStart) * Math.min(stageProgress, 1);
      callbacks.onProgress(overallProgress);

      if (stepCount >= steps) {
        clearInterval(interval);
        // Mark current stage as completed
        stages[currentStageIndex] = {
          ...stages[currentStageIndex],
          status: "completed",
        };
        callbacks.onStageUpdate([...stages]);
        currentStageIndex++;

        if (currentStageIndex < stages.length) {
          processStage();
        } else {
          // All stages complete — set to 100% and pause before completing
          callbacks.onProgress(100);
          setTimeout(() => {
            if (!cancelled) {
              const prefix = generatePrefix(segmentName, uploadCount);

              const requirements = (
                mockRequirements as ProjectData["requirements"]
              ).map((r) => ({
                ...r,
                id: `${prefix}${r.id}`,
                segment: segmentName,
              }));

              const testCases = (
                mockTestCases as ProjectData["testCases"]
              ).map((tc) => ({
                ...tc,
                id: `${prefix}${tc.id}`,
                linkedRequirements: tc.linkedRequirements.map(
                  (rid) => `${prefix}${rid}`
                ),
                segment: segmentName,
              }));

              const traceability: ProjectData["traceability"] = {
                links: (
                  mockTraceability as ProjectData["traceability"]
                ).links.map((link) => ({
                  ...link,
                  requirementId: `${prefix}${link.requirementId}`,
                  linkedTestCases: link.linkedTestCases.map(
                    (tcId) => `${prefix}${tcId}`
                  ),
                  segment: segmentName,
                })),
                summary: (mockTraceability as ProjectData["traceability"])
                  .summary,
              };

              callbacks.onComplete({ requirements, testCases, traceability });
            }
          }, 500);
        }
      }
    }, 100);
  }

  processStage();

  // Return cancel function
  return () => {
    cancelled = true;
  };
}
