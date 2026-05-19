"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ActiveRecordPanel from "./components/active-record-panel";
import AssignmentPanel, {
  AssignmentRangeSuggestion,
} from "./components/assignment-panel";
import ProgressPanel from "./components/progress-panel";
import RecordListPanel from "./components/record-list-panel";
import TopBar from "./components/top-bar";
import {
  AssignmentFilters,
  GaijiRecord,
  Judgment,
  ReviewEntry,
  ReviewStatusFilter,
  SavedWork,
} from "./review-types";
import {
  downloadJson,
  formatTimestamp,
  initialAssignment,
  sanitizeFilenamePart,
} from "./review-utils";

type CheckerClientProps = {
  records: GaijiRecord[];
  sourceFile: string;
  sourceFiles: string[];
};

function buildWeightedAssignmentRanges(
  records: GaijiRecord[],
  splitCount: number,
): AssignmentRangeSuggestion[] {
  const sortedRecords = [...records].sort((first, second) =>
    first.orgCode.localeCompare(second.orgCode),
  );
  const safeSplitCount = Math.min(
    Math.max(1, Math.trunc(splitCount) || 1),
    sortedRecords.length,
  );
  const ranges: AssignmentRangeSuggestion[] = [];
  let cursor = 0;
  let remainingWeight = sortedRecords.reduce(
    (total, record) => total + record.recordsCount,
    0,
  );

  for (let index = 0; index < safeSplitCount; index += 1) {
    const remainingParts = safeSplitCount - index;
    const targetWeight = remainingWeight / remainingParts;
    const startIndex = cursor;
    const maxEndIndex = sortedRecords.length - remainingParts;
    let rangeWeight = 0;

    while (cursor <= maxEndIndex) {
      rangeWeight += sortedRecords[cursor].recordsCount;
      cursor += 1;

      if (rangeWeight >= targetWeight) {
        break;
      }
    }

    const endIndex = cursor - 1;
    const startRecord = sortedRecords[startIndex];
    const endRecord = sortedRecords[endIndex];

    ranges.push({
      index: index + 1,
      orgCodeStart: startRecord.orgCode,
      orgCodeEnd: endRecord.orgCode,
      groupCount: endIndex - startIndex + 1,
      recordsCount: rangeWeight,
    });
    remainingWeight -= rangeWeight;
  }

  return ranges;
}

function isAssignmentFilters(value: unknown): value is AssignmentFilters {
  if (!value || typeof value !== "object") {
    return false;
  }

  const assignment = value as Record<string, unknown>;
  return (
    typeof assignment.assignee === "string" &&
    typeof assignment.orgCodeStart === "string" &&
    typeof assignment.orgCodeEnd === "string"
  );
}

export default function CheckerClient({
  records,
  sourceFile,
  sourceFiles,
}: CheckerClientProps) {
  const [assignment, setAssignment] =
    useState<AssignmentFilters>(initialAssignment);
  const [reviews, setReviews] = useState<Record<string, ReviewEntry>>({});
  const [activeId, setActiveId] = useState(records[0]?.id ?? "");
  const [statusFilter, setStatusFilter] =
    useState<ReviewStatusFilter>("all");
  const [importMessage, setImportMessage] = useState("");
  const [rangeSplitCount, setRangeSplitCount] = useState(4);
  const activeRowRef = useRef<HTMLButtonElement | null>(null);

  const rangeSuggestions = useMemo(
    () => buildWeightedAssignmentRanges(records, rangeSplitCount),
    [rangeSplitCount, records],
  );

  const assignedRecords = useMemo(() => {
    const orgCodeStart = assignment.orgCodeStart.trim();
    const orgCodeEnd = assignment.orgCodeEnd.trim();

    return records.filter((record) => {
      if (orgCodeStart && record.orgCode < orgCodeStart) {
        return false;
      }
      if (orgCodeEnd && record.orgCode > orgCodeEnd) {
        return false;
      }

      return true;
    });
  }, [assignment, records]);

  const visibleRecords = useMemo(() => {
    return assignedRecords.filter((record) => {
      const judgment = reviews[record.id]?.judgment;
      if (statusFilter === "all") {
        return true;
      }
      if (statusFilter === "todo") {
        return !judgment;
      }
      return judgment === statusFilter;
    });
  }, [assignedRecords, reviews, statusFilter]);

  const activeRecord =
    visibleRecords.find((record) => record.id === activeId) ??
    visibleRecords[0] ??
    assignedRecords[0] ??
    records[0];

  const progress = useMemo(() => {
    const judged = assignedRecords.filter(
      (record) => reviews[record.id]?.judgment,
    ).length;
    const suitable = assignedRecords.filter(
      (record) => reviews[record.id]?.judgment === "suitable",
    ).length;
    const unsuitable = assignedRecords.filter(
      (record) => reviews[record.id]?.judgment === "unsuitable",
    ).length;
    const uncertain = assignedRecords.filter(
      (record) => reviews[record.id]?.judgment === "uncertain",
    ).length;

    return {
      judged,
      suitable,
      unsuitable,
      uncertain,
      remaining: assignedRecords.length - judged,
    };
  }, [assignedRecords, reviews]);

  function updateAssignment<K extends keyof AssignmentFilters>(
    key: K,
    value: AssignmentFilters[K],
  ) {
    setAssignment((current) => ({ ...current, [key]: value }));
  }

  function selectAssignmentRange(range: AssignmentRangeSuggestion) {
    setAssignment((current) => ({
      ...current,
      orgCodeStart: range.orgCodeStart,
      orgCodeEnd: range.orgCodeEnd,
    }));
  }

  function updateRangeSplitCount(count: number) {
    const safeCount = Math.min(
      Math.max(1, Math.trunc(Number.isFinite(count) ? count : 1)),
      Math.max(1, records.length),
    );
    setRangeSplitCount(safeCount);
  }

  const moveActiveRecord = useCallback(
    (direction: 1 | -1) => {
      if (visibleRecords.length === 0) {
        return;
      }

      const currentIndex = activeRecord
        ? visibleRecords.findIndex((record) => record.id === activeRecord.id)
        : -1;
      const fallbackIndex = direction === 1 ? 0 : visibleRecords.length - 1;
      const nextIndex =
        currentIndex === -1
          ? fallbackIndex
          : Math.min(
              Math.max(currentIndex + direction, 0),
              visibleRecords.length - 1,
            );

      setActiveId(visibleRecords[nextIndex].id);
    },
    [activeRecord, visibleRecords],
  );

  const updateReview = useCallback(
    (recordId: string, patch: Partial<ReviewEntry>) => {
      setReviews((current) => ({
        ...current,
        [recordId]: {
          ...(current[recordId] ?? { note: "" }),
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    [],
  );

  const judgeAndMoveNext = useCallback(
    (judgment: Judgment) => {
      if (!activeRecord) {
        return;
      }

      updateReview(activeRecord.id, { judgment });
      moveActiveRecord(1);
    },
    [activeRecord, moveActiveRecord, updateReview],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key === "1") {
        event.preventDefault();
        judgeAndMoveNext("suitable");
      } else if (event.key === "2") {
        event.preventDefault();
        judgeAndMoveNext("unsuitable");
      } else if (event.key === "3") {
        event.preventDefault();
        judgeAndMoveNext("uncertain");
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "n") {
        event.preventDefault();
        moveActiveRecord(1);
      } else if (event.key === "ArrowLeft" || event.key.toLowerCase() === "p") {
        event.preventDefault();
        moveActiveRecord(-1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [judgeAndMoveNext, moveActiveRecord]);

  useEffect(() => {
    activeRowRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeRecord?.id]);

  function exportWork() {
    const now = new Date();
    const payload: SavedWork = {
      version: 1,
      sourceFile,
      exportedAt: now.toISOString(),
      assignment,
      reviews,
    };
    const assignee = sanitizeFilenamePart(assignment.assignee);
    downloadJson(`${assignee}_${formatTimestamp(now)}.json`, payload);
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<SavedWork>;
        if (!parsed.reviews || typeof parsed.reviews !== "object") {
          throw new Error("reviews is missing");
        }
        if (!isAssignmentFilters(parsed.assignment)) {
          throw new Error("assignment is invalid");
        }
        setReviews(parsed.reviews as Record<string, ReviewEntry>);
        setAssignment({
          assignee: parsed.assignment.assignee,
          orgCodeStart: parsed.assignment.orgCodeStart,
          orgCodeEnd: parsed.assignment.orgCodeEnd,
        });
        setImportMessage(`${file.name} を読み込みました`);
      } catch {
        setImportMessage("JSON の読み込みに失敗しました");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <main className="min-h-screen bg-base-200 p-3.5 text-base-content sm:p-6">
      <TopBar sourceFile={sourceFile} recordCount={records.length} />

      <section className="mx-auto grid max-w-375 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col gap-4">
          <AssignmentPanel
            assignment={assignment}
            rangeSplitCount={rangeSplitCount}
            rangeSuggestions={rangeSuggestions}
            onAssignmentChange={updateAssignment}
            onRangeSelect={selectAssignmentRange}
            onRangeSplitCountChange={updateRangeSplitCount}
          />

          <ProgressPanel
            assignedCount={assignedRecords.length}
            importMessage={importMessage}
            progress={progress}
            sourceFiles={sourceFiles}
            onExport={exportWork}
            onImport={handleImport}
          />
        </aside>

        <section className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(420px,0.9fr)_minmax(360px,1.1fr)]">
          <ActiveRecordPanel
            activeRecord={activeRecord}
            review={activeRecord ? reviews[activeRecord.id] : undefined}
            onReviewChange={updateReview}
          />

          <RecordListPanel
            activeRecord={activeRecord}
            activeRowRef={activeRowRef}
            records={visibleRecords}
            reviews={reviews}
            statusFilter={statusFilter}
            onActiveRecordChange={setActiveId}
            onStatusFilterChange={setStatusFilter}
          />
        </section>
      </section>
    </main>
  );
}
