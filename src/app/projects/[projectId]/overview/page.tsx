"use client";

import { use } from "react";
import Link from "next/link";
import { Project } from "@/interfaces";
import { useProjectData } from "@/context/ProjectDataContext";
import SegmentFilter from "@/components/ui/SegmentFilter";
import mockProjects from "@/data/mock-projects.json";

const projects = mockProjects as Project[];

export default function OverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const {
    isDataLoaded,
    filteredRequirements,
    filteredTestCases,
    filteredTraceability,
    segments,
    selectedSegment,
    setSelectedSegment,
  } = useProjectData();
  const project = projects.find((p) => p.id === projectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {project?.name ?? "Project Overview"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {project?.description ?? "Project details and summary"}
          </p>
        </div>
        {isDataLoaded && segments.length > 1 && (
          <SegmentFilter
            segments={segments}
            selectedSegment={selectedSegment}
            onSegmentChange={setSelectedSegment}
          />
        )}
      </div>

      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted">Status</p>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                project?.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : project?.status === "Completed"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {project?.status ?? "Unknown"}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted">Created</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {project?.createdAt ?? "\u2014"}
            </p>
          </div>
        </div>
      </div>

      {isDataLoaded ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <p className="text-sm text-muted">Requirements</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {filteredRequirements.length}
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <p className="text-sm text-muted">Test Cases</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {filteredTestCases.length}
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <p className="text-sm text-muted">Coverage</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {filteredTraceability?.summary.coveragePercentage ?? 0}%
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-card-border bg-card-bg p-12 text-center">
          <p className="text-muted">
            No data available yet.{" "}
            <Link
              href={`/projects/${projectId}/upload`}
              className="text-primary hover:underline"
            >
              Upload project documents
            </Link>{" "}
            to get started.
          </p>
        </div>
      )}
    </div>
  );
}
