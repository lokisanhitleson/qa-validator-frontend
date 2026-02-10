"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import {
  ProjectData,
  Requirement,
  TestCase,
  TraceabilityLink,
  TraceabilityMatrix,
} from "@/interfaces";

interface ProjectDataContextType {
  projectData: ProjectData | null;
  isDataLoaded: boolean;
  segments: string[];
  selectedSegment: string;
  setSelectedSegment: (segment: string) => void;
  uploadCount: number;
  filteredRequirements: Requirement[];
  filteredTestCases: TestCase[];
  filteredTraceability: TraceabilityMatrix | null;
  addSegmentData: (data: ProjectData, segmentName: string) => void;
  clearProjectData: () => void;
  updateRequirement: (
    id: string,
    updates: Partial<Pick<Requirement, "title" | "type" | "description">>
  ) => void;
  updateTestCase: (
    id: string,
    updates: Partial<Pick<TestCase, "title" | "steps">>
  ) => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(
  undefined
);

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [segments, setSegments] = useState<string[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>("All");
  const [uploadCount, setUploadCount] = useState(0);

  const addSegmentData = (data: ProjectData, segmentName: string) => {
    setProjectData((prev) => {
      if (!prev) return data;
      return {
        requirements: [...prev.requirements, ...data.requirements],
        testCases: [...prev.testCases, ...data.testCases],
        traceability: {
          links: [...prev.traceability.links, ...data.traceability.links],
          summary: prev.traceability.summary, // will be recomputed via filtered getter
        },
      };
    });
    setSegments((prev) =>
      prev.includes(segmentName) ? prev : [...prev, segmentName]
    );
    setUploadCount((prev) => prev + 1);
  };

  const clearProjectData = () => {
    setProjectData(null);
    setSegments([]);
    setSelectedSegment("All");
    setUploadCount(0);
  };

  const updateRequirement = (
    id: string,
    updates: Partial<Pick<Requirement, "title" | "type" | "description">>
  ) => {
    setProjectData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        requirements: prev.requirements.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
        traceability: {
          ...prev.traceability,
          links:
            updates.title !== undefined
              ? prev.traceability.links.map((l) =>
                  l.requirementId === id
                    ? { ...l, requirementTitle: updates.title! }
                    : l
                )
              : prev.traceability.links,
        },
      };
    });
  };

  const updateTestCase = (
    id: string,
    updates: Partial<Pick<TestCase, "title" | "steps">>
  ) => {
    setProjectData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        testCases: prev.testCases.map((tc) =>
          tc.id === id ? { ...tc, ...updates } : tc
        ),
      };
    });
  };

  const filteredRequirements = useMemo(() => {
    if (!projectData) return [];
    if (selectedSegment === "All") return projectData.requirements;
    return projectData.requirements.filter(
      (r) => r.segment === selectedSegment
    );
  }, [projectData, selectedSegment]);

  const filteredTestCases = useMemo(() => {
    if (!projectData) return [];
    if (selectedSegment === "All") return projectData.testCases;
    return projectData.testCases.filter(
      (tc) => tc.segment === selectedSegment
    );
  }, [projectData, selectedSegment]);

  const filteredTraceability = useMemo((): TraceabilityMatrix | null => {
    if (!projectData) return null;
    const links: TraceabilityLink[] =
      selectedSegment === "All"
        ? projectData.traceability.links
        : projectData.traceability.links.filter(
            (l) => l.segment === selectedSegment
          );
    const totalRequirements = links.length;
    const coveredRequirements = links.filter(
      (l) => l.coverage === "Covered" || l.coverage === "Partial"
    ).length;
    const coveragePercentage =
      totalRequirements > 0
        ? Math.round((coveredRequirements / totalRequirements) * 100)
        : 0;
    return {
      links,
      summary: { totalRequirements, coveredRequirements, coveragePercentage },
    };
  }, [projectData, selectedSegment]);

  return (
    <ProjectDataContext.Provider
      value={{
        projectData,
        isDataLoaded: !!projectData,
        segments,
        selectedSegment,
        setSelectedSegment,
        uploadCount,
        filteredRequirements,
        filteredTestCases,
        filteredTraceability,
        addSegmentData,
        clearProjectData,
        updateRequirement,
        updateTestCase,
      }}
    >
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error(
      "useProjectData must be used within a ProjectDataProvider"
    );
  }
  return context;
}
