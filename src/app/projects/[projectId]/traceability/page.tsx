"use client";

import {
  useState,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { useProjectData } from "@/context/ProjectDataContext";
import SegmentFilter from "@/components/ui/SegmentFilter";

type ActiveTab = "table" | "graph";

interface Connection {
  reqId: string;
  testId: string;
  coverage: "Covered" | "Partial" | "Uncovered";
}

export default function TraceabilityPage() {
  const {
    isDataLoaded,
    filteredTraceability,
    filteredTestCases,
    segments,
    selectedSegment,
    setSelectedSegment,
  } = useProjectData();

  const [activeTab, setActiveTab] = useState<ActiveTab>("table");
  const [expandedReqIds, setExpandedReqIds] = useState<Set<string>>(new Set());

  // Refs for SVG line drawing
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reqRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const tcRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number; coverage: string; reqId: string }[]
  >([]);

  // Derive unique test cases and connections from traceability data
  const { uniqueTestCases, connections } = useMemo(() => {
    if (!filteredTraceability) return { uniqueTestCases: [], connections: [] };

    const tcIdSet = new Set<string>();
    const conns: Connection[] = [];

    for (const link of filteredTraceability.links) {
      for (const tcId of link.linkedTestCases) {
        tcIdSet.add(tcId);
        conns.push({
          reqId: link.requirementId,
          testId: tcId,
          coverage: link.coverage,
        });
      }
    }

    const tcDetails = filteredTestCases.filter((tc) => tcIdSet.has(tc.id));

    return { uniqueTestCases: tcDetails, connections: conns };
  }, [filteredTraceability, filteredTestCases]);

  // Calculate SVG line positions
  const recalcLines = useCallback(() => {
    if (!containerRef.current || !svgRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: typeof lines = [];

    for (const conn of connections) {
      const reqEl = reqRefs.current.get(conn.reqId);
      const tcEl = tcRefs.current.get(conn.testId);
      if (!reqEl || !tcEl) continue;

      const reqRect = reqEl.getBoundingClientRect();
      const tcRect = tcEl.getBoundingClientRect();

      newLines.push({
        x1: reqRect.right - containerRect.left,
        y1: reqRect.top + reqRect.height / 2 - containerRect.top,
        x2: tcRect.left - containerRect.left,
        y2: tcRect.top + tcRect.height / 2 - containerRect.top,
        coverage: conn.coverage,
        reqId: conn.reqId,
      });
    }

    setLines(newLines);
  }, [connections]);

  // Recalculate lines on layout changes
  useLayoutEffect(() => {
    if (activeTab !== "graph" || !filteredTraceability) return;

    // Small delay to let the DOM settle
    const timer = setTimeout(recalcLines, 50);

    const observer = new ResizeObserver(() => recalcLines());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab, filteredTraceability, recalcLines, expandedReqIds, selectedSegment]);

  const toggleReq = (id: string) => {
    setExpandedReqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    if (!filteredTraceability) return;
    setExpandedReqIds(new Set(filteredTraceability.links.map((l) => l.requirementId)));
  };

  const collapseAll = () => setExpandedReqIds(new Set());

  const hasExpanded = expandedReqIds.size > 0;

  const coverageColor = (coverage: string) => {
    if (coverage === "Covered") return { border: "border-green-500", line: "#22c55e", bg: "bg-green-50" };
    if (coverage === "Partial") return { border: "border-yellow-500", line: "#eab308", bg: "bg-yellow-50" };
    return { border: "border-red-500", line: "#ef4444", bg: "bg-red-50" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Traceability Matrix
          </h1>
          <p className="mt-1 text-sm text-muted">
            Requirement-to-test-case coverage mapping
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

      {isDataLoaded && filteredTraceability ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <p className="text-sm text-muted">Total Requirements</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {filteredTraceability.summary.totalRequirements}
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <p className="text-sm text-muted">Covered</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {filteredTraceability.summary.coveredRequirements}
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <p className="text-sm text-muted">Coverage</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {filteredTraceability.summary.coveragePercentage}%
              </p>
            </div>
          </div>

          {/* Tab bar */}
          <div
            role="tablist"
            aria-label="Traceability view"
            className="flex gap-6 border-b border-card-border"
          >
            <button
              role="tab"
              aria-selected={activeTab === "table"}
              onClick={() => setActiveTab("table")}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === "table"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Table Matrix
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "graph"}
              onClick={() => setActiveTab("graph")}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === "graph"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Node Graph
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "table" ? (
            <div className="rounded-xl border border-card-border bg-card-bg p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-card-border">
                      <th className="pb-3 pr-4 font-medium text-muted">
                        Requirement
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted">Title</th>
                      <th className="pb-3 pr-4 font-medium text-muted">
                        Linked Test Cases
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted">Coverage</th>
                      <th className="pb-3 font-medium text-muted">Segment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTraceability.links.map((link) => (
                      <tr
                        key={link.requirementId}
                        className="border-b border-card-border last:border-0"
                      >
                        <td className="py-3 pr-4 font-mono text-xs">
                          {link.requirementId}
                        </td>
                        <td className="py-3 pr-4">{link.requirementTitle}</td>
                        <td className="py-3 pr-4 font-mono text-xs">
                          {link.linkedTestCases.length > 0
                            ? link.linkedTestCases.join(", ")
                            : "\u2014"}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              link.coverage === "Covered"
                                ? "bg-green-100 text-green-700"
                                : link.coverage === "Partial"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {link.coverage}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {link.segment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Node Graph view */
            <div className="space-y-3">
              {/* Controls */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">
                  Click a requirement to highlight its connections
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-gray-100"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    className="rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-gray-100"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Graph */}
              <div className="overflow-x-auto rounded-xl border border-card-border bg-card-bg p-6">
                <div
                  ref={containerRef}
                  className="relative min-w-[640px]"
                >
                  {/* SVG lines layer */}
                  <svg
                    ref={svgRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    style={{ zIndex: 1 }}
                  >
                    {lines.map((line, i) => {
                      const colors = coverageColor(line.coverage);
                      const isExpanded = expandedReqIds.has(line.reqId);
                      const anyExpanded = hasExpanded;
                      const opacity = anyExpanded
                        ? isExpanded
                          ? 0.85
                          : 0.15
                        : 0.5;
                      const strokeWidth = anyExpanded && isExpanded ? 2.5 : 1.5;

                      return (
                        <line
                          key={i}
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke={colors.line}
                          strokeWidth={strokeWidth}
                          opacity={opacity}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>

                  {/* Two-column layout */}
                  <div className="relative grid grid-cols-2 gap-24" style={{ zIndex: 2 }}>
                    {/* Requirements column (left) */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Requirements
                      </h3>
                      {filteredTraceability.links.map((link) => {
                        const colors = coverageColor(link.coverage);
                        const isExpanded = expandedReqIds.has(link.requirementId);

                        return (
                          <div
                            key={link.requirementId}
                            ref={(el) => {
                              if (el) reqRefs.current.set(link.requirementId, el);
                              else reqRefs.current.delete(link.requirementId);
                            }}
                            onClick={() => toggleReq(link.requirementId)}
                            className={`cursor-pointer rounded-lg border-2 ${colors.border} ${colors.bg} p-3 transition-all ${
                              isExpanded ? "ring-2 ring-primary" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {link.requirementId}
                              </span>
                              <div className="flex items-center gap-2">
                                {link.coverage === "Uncovered" && (
                                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                    Uncovered
                                  </span>
                                )}
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    link.coverage === "Covered"
                                      ? "bg-green-100 text-green-700"
                                      : link.coverage === "Partial"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {link.coverage}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-foreground/80 leading-snug">
                              {link.requirementTitle}
                            </p>
                            {isExpanded && (
                              <p className="mt-1.5 text-[10px] text-muted">
                                {link.linkedTestCases.length} linked test case
                                {link.linkedTestCases.length !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Test cases column (right) */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Test Cases
                      </h3>
                      {uniqueTestCases.map((tc) => (
                        <div
                          key={tc.id}
                          ref={(el) => {
                            if (el) tcRefs.current.set(tc.id, el);
                            else tcRefs.current.delete(tc.id);
                          }}
                          className="rounded-lg border border-card-border bg-white p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {tc.id}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                tc.type === "Positive"
                                  ? "bg-green-100 text-green-700"
                                  : tc.type === "Negative"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {tc.type}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-foreground/80 leading-snug">
                            {tc.title}
                          </p>
                        </div>
                      ))}
                      {uniqueTestCases.length === 0 && (
                        <p className="py-4 text-center text-xs text-muted">
                          No linked test cases
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-card-border bg-card-bg p-12 text-center">
          <p className="text-muted">
            No data available. Please upload project documents first.
          </p>
        </div>
      )}
    </div>
  );
}
