"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useProjectData } from "@/context/ProjectDataContext";
import { Requirement } from "@/interfaces";

type SortKey = "id" | "type" | "title" | "description" | "tests" | "segment";
type SortDir = "asc" | "desc";
type TypeFilter = "All" | "Functional" | "Non-Functional";

const PAGE_SIZES = [5, 10, 20, 50];
const TRUNCATE_LEN = 25;

export default function RequirementsPage() {
  const {
    isDataLoaded,
    filteredRequirements,
    filteredTestCases,
    segments,
    selectedSegment,
    setSelectedSegment,
    updateRequirement,
  } = useProjectData();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tooltip state for statement hover (fixed positioning to escape overflow clip)
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(
    (e: React.MouseEvent, text: string) => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltip({ text, x: rect.left, y: rect.top });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    tooltipTimeout.current = setTimeout(() => setTooltip(null), 100);
  }, []);

  // Edit modal state
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "Functional" as Requirement["type"],
    description: "",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const openEditModal = (req: Requirement) => {
    setEditingReq(req);
    setEditForm({
      title: req.title,
      type: req.type,
      description: req.description,
    });
    setEditErrors({});
  };

  const closeEditModal = () => {
    setEditingReq(null);
    setEditErrors({});
  };

  const validateEditForm = () => {
    const errors: Record<string, string> = {};
    if (!editForm.title.trim()) errors.title = "Title is required";
    if (!editForm.description.trim())
      errors.description = "Statement is required";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = () => {
    if (!editingReq || !validateEditForm()) return;
    updateRequirement(editingReq.id, {
      title: editForm.title.trim(),
      type: editForm.type,
      description: editForm.description.trim(),
    });
    closeEditModal();
  };

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

  // Apply type filter + search
  const filtered = useMemo(() => {
    let result = filteredRequirements;

    if (typeFilter !== "All") {
      result = result.filter((r) => r.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (testCountMap[r.id] ?? 0).toString().includes(q) ||
          r.segment.toLowerCase().includes(q)
      );
    }

    return result;
  }, [filteredRequirements, typeFilter, search, testCountMap]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortKey) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        case "title":
          aVal = a.title;
          bVal = b.title;
          break;
        case "description":
          aVal = a.description;
          bVal = b.description;
          break;
        case "tests":
          aVal = testCountMap[a.id] ?? 0;
          bVal = testCountMap[b.id] ?? 0;
          break;
        case "segment":
          aVal = a.segment;
          bVal = b.segment;
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir, testCountMap]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Reset page when filters change
  const handleTypeFilter = (val: TypeFilter) => {
    setTypeFilter(val);
    setPage(1);
  };
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handlePageSize = (val: number) => {
    setPageSize(val);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return (
        <svg
          className="ml-1 inline h-3.5 w-3.5 text-muted/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
        </svg>
      );
    }
    return sortDir === "asc" ? (
      <svg
        className="ml-1 inline h-3.5 w-3.5 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M8 15l4-4 4 4" />
      </svg>
    ) : (
      <svg
        className="ml-1 inline h-3.5 w-3.5 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M8 9l4 4 4-4" />
      </svg>
    );
  };

  const truncate = (text: string) =>
    text.length > TRUNCATE_LEN
      ? text.slice(0, TRUNCATE_LEN) + "..."
      : text;

  const typeBadge = (req: Requirement) => {
    const isFR = req.type === "Functional";
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isFR ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
          }`}
      >
        {isFR ? "FR" : "NFR"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Requirements</h1>
        <p className="mt-1 text-sm text-muted">
          AI-enhanced, context-rich requirements extracted from your project
          documents
        </p>
      </div>

      {isDataLoaded ? (
        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          {/* Filters row */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

              {/* Type filter */}
              <div className="inline-flex rounded-lg border border-input-border bg-input-bg text-sm">
                {(["All", "Functional", "Non-Functional"] as TypeFilter[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeFilter(t)}
                      className={`px-3 py-2 transition-colors first:rounded-l-lg last:rounded-r-lg ${typeFilter === t
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-gray-100"
                        }`}
                    >
                      {t === "Functional"
                        ? "FR"
                        : t === "Non-Functional"
                          ? "NFR"
                          : "All"}
                    </button>
                  )
                )}
              </div>

              {/* Count badge */}
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {filtered.length} requirement{filtered.length !== 1 ? "s" : ""}
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
                placeholder="Search requirements..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-input-border bg-input-bg py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
              />
            </div>
          </div>

          {/* Table */}
          <div className="-mx-6 overflow-x-auto px-6">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  {(
                    [
                      { key: "id", label: "ID", width: "min-w-[80px] w-[8%]" },
                      { key: "type", label: "Type", width: "min-w-[80px] w-[8%]" },
                      { key: "title", label: "Title", width: "min-w-[140px] w-[22%]" },
                      { key: "description", label: "Statement", width: "min-w-[180px] w-[34%]" },
                      { key: "tests", label: "No. of Tests", width: "min-w-[120px] w-[12%]" },
                      { key: "segment", label: "Segment", width: "min-w-[130px] w-[14%]" },
                    ] as { key: SortKey; label: string; width: string }[]
                  ).map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`cursor-pointer select-none pb-3 pr-4 font-medium text-muted transition-colors hover:text-foreground ${col.width}`}
                    >
                      {col.label}
                      <SortIcon column={col.key} />
                    </th>
                  ))}
                  <th className="min-w-[60px] w-[4%] pb-3 font-medium text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-sm text-muted"
                    >
                      No requirements match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-card-border last:border-0 transition-colors hover:bg-gray-50"
                    >
                      <td className="py-3 pr-4 font-mono text-xs">
                        {req.id}
                      </td>
                      <td className="py-3 pr-4">{typeBadge(req)}</td>
                      <td className="py-3 pr-4 font-medium">{req.title}</td>
                      <td className="py-3 pr-4">
                        {req.description.length > TRUNCATE_LEN ? (
                          <span
                            className="cursor-default text-muted"
                            onMouseEnter={(e) =>
                              showTooltip(e, req.description)
                            }
                            onMouseLeave={hideTooltip}
                          >
                            {truncate(req.description)}
                          </span>
                        ) : (
                          <span className="text-muted">
                            {req.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          {testCountMap[req.id] ?? 0}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {truncate(req.segment)}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => openEditModal(req)}
                          className="rounded p-1.5 text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                          title="Edit requirement"
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Fixed tooltip (renders outside overflow container) */}
          {tooltip && (
            <div
              className="pointer-events-none fixed z-[9999] max-w-xs rounded-lg border border-card-border bg-white p-3 text-xs leading-relaxed text-foreground shadow-lg"
              style={{
                left: tooltip.x,
                top: tooltip.y - 8,
                transform: "translateY(-100%)",
              }}
            >
              {tooltip.text}
            </div>
          )}

          {/* Pagination */}
          {sorted.length > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-card-border pt-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSize(Number(e.target.value))}
                  className="rounded border border-input-border bg-input-bg px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span>
                  {(safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, sorted.length)} of{" "}
                  {sorted.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={safePage === 1}
                  className="rounded p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  title="First page"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous page"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1
                  )
                  .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push("ellipsis");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "ellipsis" ? (
                      <span
                        key={`e${i}`}
                        className="px-1 text-sm text-muted"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`min-w-[2rem] rounded px-2 py-1 text-sm transition-colors ${safePage === item
                          ? "bg-primary text-white"
                          : "text-muted hover:bg-gray-100 hover:text-foreground"
                          }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage === totalPages}
                  className="rounded p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Next page"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="rounded p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Last page"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M6 5l7 7-7 7M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-card-border bg-card-bg p-12 text-center">
          <p className="text-muted">
            No data available. Please upload project documents first.
          </p>
        </div>
      )}

      {/* Edit Requirement Modal */}
      {editingReq && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Edit Requirement
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

            {/* ID (read-only) */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-foreground">
                Requirement ID
              </label>
              <div className="rounded-lg border border-input-border bg-gray-100 px-3 py-2 text-sm text-muted">
                {editingReq.id}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label
                htmlFor="edit-title"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                value={editForm.title}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, title: e.target.value }));
                  if (editErrors.title)
                    setEditErrors((prev) => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                  editErrors.title
                    ? "border-red-400 focus:border-red-400"
                    : "border-input-border bg-input-bg focus:border-primary"
                }`}
              />
              {editErrors.title && (
                <p className="mt-1 text-xs text-red-500">{editErrors.title}</p>
              )}
            </div>

            {/* Type */}
            <div className="mb-4">
              <label
                htmlFor="edit-type"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Type
              </label>
              <select
                id="edit-type"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    type: e.target.value as Requirement["type"],
                  }))
                }
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="Functional">Functional (FR)</option>
                <option value="Non-Functional">Non-Functional (NFR)</option>
              </select>
            </div>

            {/* Statement / Description */}
            <div className="mb-6">
              <label
                htmlFor="edit-description"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                id="edit-description"
                rows={4}
                value={editForm.description}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, description: e.target.value }));
                  if (editErrors.description)
                    setEditErrors((prev) => {
                      const next = { ...prev };
                      delete next.description;
                      return next;
                    });
                }}
                className={`w-full resize-y rounded-lg border px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                  editErrors.description
                    ? "border-red-400 focus:border-red-400"
                    : "border-input-border bg-input-bg focus:border-primary"
                }`}
              />
              {editErrors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {editErrors.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
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
