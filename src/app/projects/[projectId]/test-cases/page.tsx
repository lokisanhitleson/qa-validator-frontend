"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useProjectData } from "@/context/ProjectDataContext";
import { Requirement, TestCase, TestStep } from "@/interfaces";

type TypeFilter = "All" | "Positive" | "Negative" | "Boundary";

const BATCH_SIZE = 10;
const LOAD_DELAY_MS = 600;

export default function TestCasesPage() {
  const {
    isDataLoaded,
    filteredTestCases,
    filteredRequirements,
    segments,
    selectedSegment,
    setSelectedSegment,
    updateTestCase,
  } = useProjectData();

  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [reqFilter, setReqFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Collapsible steps
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Infinite scroll
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Edit modal
  const [editingTc, setEditingTc] = useState<TestCase | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSteps, setEditSteps] = useState<TestStep[]>([]);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Requirement detail panel
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  // Lookup map: requirement ID -> Requirement object
  const reqMap = useMemo(() => {
    const map: Record<string, Requirement> = {};
    filteredRequirements.forEach((r) => {
      map[r.id] = r;
    });
    return map;
  }, [filteredRequirements]);

  // Map: requirementId -> number of linked test cases
  const testCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTestCases.forEach((tc) => {
      tc.linkedRequirements.forEach((reqId) => {
        map[reqId] = (map[reqId] || 0) + 1;
      });
    });
    return map;
  }, [filteredTestCases]);

  const selectedReq = selectedReqId ? reqMap[selectedReqId] ?? null : null;

  // Unique requirement IDs from filtered test cases
  const uniqueReqIds = useMemo(() => {
    const ids = new Set<string>();
    filteredTestCases.forEach((tc) =>
      tc.linkedRequirements.forEach((r) => ids.add(r))
    );
    return Array.from(ids).sort();
  }, [filteredTestCases]);

  // Apply filters + search
  const filtered = useMemo(() => {
    let result = filteredTestCases;

    if (typeFilter !== "All") {
      result = result.filter((tc) => tc.type === typeFilter);
    }

    if (reqFilter !== "All") {
      result = result.filter((tc) =>
        tc.linkedRequirements.includes(reqFilter)
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (tc) =>
          tc.id.toLowerCase().includes(q) ||
          tc.title.toLowerCase().includes(q) ||
          tc.description.toLowerCase().includes(q) ||
          tc.linkedRequirements.some((r) => r.toLowerCase().includes(q)) ||
          tc.steps.some(
            (s) =>
              s.action.toLowerCase().includes(q) ||
              s.expectedResult.toLowerCase().includes(q)
          )
      );
    }

    return result;
  }, [filteredTestCases, typeFilter, reqFilter, search]);

  // Reset displayCount when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayCount(BATCH_SIZE);
  }, [typeFilter, reqFilter, search, selectedSegment]);

  const displayed = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayCount((prev) => prev + BATCH_SIZE);
            setIsLoadingMore(false);
          }, LOAD_DELAY_MS);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  // Step toggle
  const toggleStep = (tcId: string, stepNum: number) => {
    const key = `${tcId}-${stepNum}`;
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Edit modal handlers
  const openEditModal = (tc: TestCase) => {
    setEditingTc(tc);
    setEditTitle(tc.title);
    setEditSteps(tc.steps.map((s) => ({ ...s })));
    setEditErrors({});
  };

  const closeEditModal = () => {
    setEditingTc(null);
    setEditErrors({});
  };

  const validateEditForm = () => {
    const errors: Record<string, string> = {};
    if (!editTitle.trim()) errors.title = "Title is required";
    editSteps.forEach((s, i) => {
      if (!s.action.trim()) errors[`step-${i}-action`] = "Action is required";
      if (!s.expectedResult.trim())
        errors[`step-${i}-expected`] = "Expected result is required";
    });
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = () => {
    if (!editingTc || !validateEditForm()) return;
    updateTestCase(editingTc.id, {
      title: editTitle.trim(),
      steps: editSteps.map((s) => ({
        ...s,
        action: s.action.trim(),
        expectedResult: s.expectedResult.trim(),
      })),
    });
    closeEditModal();
  };

  const updateStepField = (
    index: number,
    field: "action" | "expectedResult",
    value: string
  ) => {
    setEditSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
    const errorKey =
      field === "action"
        ? `step-${index}-action`
        : `step-${index}-expected`;
    if (editErrors[errorKey]) {
      setEditErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  // Filter reset helpers
  const handleTypeFilter = (val: TypeFilter) => {
    setTypeFilter(val);
  };

  const handleReqFilter = (val: string) => {
    setReqFilter(val);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
  };

  // Badge helpers
  const typeBadgeClass = (type: TestCase["type"]) => {
    switch (type) {
      case "Positive":
        return "bg-green-100 text-green-700";
      case "Negative":
        return "bg-red-100 text-red-700";
      case "Boundary":
        return "bg-orange-100 text-orange-700";
    }
  };

  const priorityBadgeClass = (priority: TestCase["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
    }
  };

  const statusBadgeClass = (status: TestCase["status"]) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-700";
      case "In Review":
        return "bg-yellow-100 text-yellow-700";
      case "Draft":
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Test Cases</h1>
        <p className="mt-1 text-sm text-muted">
          AI-generated test cases from your requirements
        </p>
      </div>

      {isDataLoaded ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {/* Segment filter */}
                {segments.length > 0 && (
                  <select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="All">All Segments</option>
                    {segments.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}

                {/* Requirement filter */}
                {uniqueReqIds.length > 0 && (
                  <select
                    value={reqFilter}
                    onChange={(e) => handleReqFilter(e.target.value)}
                    className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="All">All Requirements</option>
                    {uniqueReqIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                )}

                {/* Type filter toggle */}
                <div className="inline-flex rounded-lg border border-input-border bg-input-bg text-sm">
                  {(
                    ["All", "Positive", "Negative", "Boundary"] as TypeFilter[]
                  ).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeFilter(t)}
                      className={`px-3 py-2 transition-colors first:rounded-l-lg last:rounded-r-lg ${typeFilter === t
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-gray-100"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Count badge */}
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {filtered.length} test case{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search test cases..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-input-border bg-input-bg py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Cards list */}
          {displayed.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-card-bg p-12 text-center">
              <p className="text-muted">
                No test cases match your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((tc) => (
                <div
                  key={tc.id}
                  className="rounded-xl border border-card-border bg-card-bg"
                >
                  {/* Card header */}
                  <div className="p-4">
                    {/* Row 1: ID, linked reqs, title, edit */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                          {tc.id}
                        </span>
                        {tc.linkedRequirements.map((reqId) => (
                          <button
                            key={reqId}
                            onClick={() => setSelectedReqId(reqId)}
                            className="inline-flex rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200 cursor-pointer"
                            title={`View ${reqId} details`}
                          >
                            {reqId}
                          </button>
                        ))}
                        <span className="text-sm font-medium text-foreground">
                          {tc.title}
                        </span>
                      </div>
                      <button
                        onClick={() => openEditModal(tc)}
                        className="shrink-0 rounded p-1.5 text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Edit test case"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>

                    {/* Row 2: Badges */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass(tc.type)}`}
                      >
                        {tc.type}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadgeClass(tc.priority)}`}
                      >
                        {tc.priority}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(tc.status)}`}
                      >
                        {tc.status}
                      </span>
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {tc.segment}
                      </span>
                    </div>
                  </div>

                  {/* Steps section */}
                  {tc.steps.length > 0 && (
                    <div className="border-t border-card-border p-4">
                      <div className="space-y-2">
                        {tc.steps.map((s) => {
                          const stepKey = `${tc.id}-${s.step}`;
                          const expanded = expandedSteps.has(stepKey);
                          return (
                            <div
                              key={stepKey}
                              className="rounded-lg border border-card-border"
                            >
                              <button
                                onClick={() => toggleStep(tc.id, s.step)}
                                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-gray-50"
                              >
                                <span>Step {s.step}</span>
                                <svg
                                  className={`h-4 w-4 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </button>
                              {expanded && (
                                <div className="border-t border-card-border px-4 py-3 space-y-2">
                                  <div>
                                    <span className="text-xs font-medium text-muted">
                                      Action
                                    </span>
                                    <p className="text-sm text-foreground">
                                      {s.action}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-muted">
                                      Expected Result
                                    </span>
                                    <p className="text-sm text-foreground">
                                      {s.expectedResult}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 py-4">
              <svg
                className="h-5 w-5 animate-spin text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm text-muted">
                Loading more test cases...
              </span>
            </div>
          )}

          {/* Footer count */}
          {filtered.length > 0 && (
            <p className="text-center text-sm text-muted">
              Showing {displayed.length} of {filtered.length} test case
              {filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-card-border bg-card-bg p-12 text-center">
          <p className="text-muted">
            No data available. Please upload project documents first.
          </p>
        </div>
      )}

      {/* Requirement Detail Slide-in Panel */}
      {selectedReqId && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 transition-opacity my-0"
            onClick={() => setSelectedReqId(null)}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md border-l border-card-border bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex h-full flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Requirement Details
                </h2>
                <button
                  onClick={() => setSelectedReqId(null)}
                  className="rounded p-1 text-muted transition-colors hover:bg-gray-100 hover:text-foreground"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {selectedReq ? (
                  <div className="space-y-5">
                    {/* Requirement ID */}
                    <div>
                      <span className="text-xs font-medium text-muted">
                        Requirement ID
                      </span>
                      <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                        {selectedReq.id}
                      </p>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="text-xs font-medium text-muted">
                        Type
                      </span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedReq.type === "Functional"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                            }`}
                        >
                          {selectedReq.type === "Functional" ? "FR" : "NFR"} —{" "}
                          {selectedReq.type}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <span className="text-xs font-medium text-muted">
                        Title
                      </span>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedReq.title}
                      </p>
                    </div>

                    {/* Statement / Description */}
                    <div>
                      <span className="text-xs font-medium text-muted">
                        Statement
                      </span>
                      <p className="mt-1 text-sm leading-relaxed text-foreground">
                        {selectedReq.description}
                      </p>
                    </div>

                    {/* Priority & Status */}
                    <div className="flex gap-6">
                      <div>
                        <span className="text-xs font-medium text-muted">
                          Priority
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedReq.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : selectedReq.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                              }`}
                          >
                            {selectedReq.priority}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted">
                          Status
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedReq.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : selectedReq.status === "In Review"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {selectedReq.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* No. of Test Cases */}
                    <div>
                      <span className="text-xs font-medium text-muted">
                        No. of Test Cases
                      </span>
                      <div className="mt-1">
                        <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          {testCountMap[selectedReq.id] ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Segment */}
                    <div>
                      <span className="text-xs font-medium text-muted">
                        Segment
                      </span>
                      <div className="mt-1">
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {selectedReq.segment}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted">
                      Requirement{" "}
                      <span className="font-mono font-semibold">
                        {selectedReqId}
                      </span>{" "}
                      not found in current data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Test Case Modal */}
      {editingTc && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Edit Test Case
              </h2>
              <button
                onClick={closeEditModal}
                className="rounded p-1 text-muted transition-colors hover:bg-gray-100 hover:text-foreground"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {/* ID (read-only) */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Test Case ID
                </label>
                <div className="rounded-lg border border-input-border bg-gray-100 px-3 py-2 text-sm text-muted">
                  {editingTc.id}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label
                  htmlFor="edit-tc-title"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-tc-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (editErrors.title)
                      setEditErrors((prev) => {
                        const next = { ...prev };
                        delete next.title;
                        return next;
                      });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${editErrors.title
                    ? "border-red-400 focus:border-red-400"
                    : "border-input-border bg-input-bg focus:border-primary"
                    }`}
                />
                {editErrors.title && (
                  <p className="mt-1 text-xs text-red-500">
                    {editErrors.title}
                  </p>
                )}
              </div>

              {/* Steps */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Steps
                </label>
                <div className="space-y-4">
                  {editSteps.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-card-border p-3"
                    >
                      <p className="mb-2 text-xs font-semibold text-muted">
                        Step {s.step}
                      </p>
                      <div className="mb-2">
                        <label
                          htmlFor={`edit-step-${i}-action`}
                          className="mb-1 block text-xs font-medium text-foreground"
                        >
                          Action <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`edit-step-${i}-action`}
                          type="text"
                          value={s.action}
                          onChange={(e) =>
                            updateStepField(i, "action", e.target.value)
                          }
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${editErrors[`step-${i}-action`]
                            ? "border-red-400 focus:border-red-400"
                            : "border-input-border bg-input-bg focus:border-primary"
                            }`}
                        />
                        {editErrors[`step-${i}-action`] && (
                          <p className="mt-1 text-xs text-red-500">
                            {editErrors[`step-${i}-action`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`edit-step-${i}-expected`}
                          className="mb-1 block text-xs font-medium text-foreground"
                        >
                          Expected Result{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`edit-step-${i}-expected`}
                          type="text"
                          value={s.expectedResult}
                          onChange={(e) =>
                            updateStepField(
                              i,
                              "expectedResult",
                              e.target.value
                            )
                          }
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${editErrors[`step-${i}-expected`]
                            ? "border-red-400 focus:border-red-400"
                            : "border-input-border bg-input-bg focus:border-primary"
                            }`}
                        />
                        {editErrors[`step-${i}-expected`] && (
                          <p className="mt-1 text-xs text-red-500">
                            {editErrors[`step-${i}-expected`]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
              <button
                onClick={closeEditModal}
                className="rounded-lg border border-input-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
