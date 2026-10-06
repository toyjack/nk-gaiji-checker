import { RefObject, useEffect, useRef, useState } from "react";
import {
  GaijiRecord,
  ReviewEntry,
  ReviewStatusFilter,
} from "../review-types";
import { judgmentLabels } from "../review-utils";
import { glyphWikiSvgUrl } from "../glyphwiki-utils";

type RecordListPanelProps = {
  activeRecord?: GaijiRecord;
  activeRowRef: RefObject<HTMLButtonElement | null>;
  records: GaijiRecord[];
  reviews: Record<string, ReviewEntry>;
  statusFilter: ReviewStatusFilter;
  onActiveRecordChange: (recordId: string) => void;
  onStatusFilterChange: (statusFilter: ReviewStatusFilter) => void;
};

export default function RecordListPanel({
  activeRecord,
  activeRowRef,
  records,
  reviews,
  statusFilter,
  onActiveRecordChange,
  onStatusFilterChange,
}: RecordListPanelProps) {
  const [loadedCount, setLoadedCount] = useState(500);
  const listRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLButtonElement | null>(null);
  const activeIndex = activeRecord
    ? records.findIndex((record) => record.id === activeRecord.id)
    : -1;
  const visibleCount = Math.max(loadedCount, activeIndex + 1);

  useEffect(() => {
    const button = loadMoreRef.current;
    const list = listRef.current;
    if (!button || !list || visibleCount >= records.length || !window.IntersectionObserver) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadedCount((count) =>
            Math.min(Math.max(count, visibleCount) + 250, records.length),
          );
        }
      },
      { root: list, rootMargin: "200px" },
    );
    observer.observe(button);
    return () => observer.disconnect();
  }, [records.length, visibleCount]);

  return (
    <section className="card max-h-[calc(100dvh-2rem)] overflow-hidden border border-base-300 bg-base-100 shadow-sm xl:max-h-[calc(100dvh-8rem)]">
      <div className="card-body flex min-h-0 flex-col">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
          <h2 className="card-title text-lg">リスト</h2>
          <select
            className="select select-bordered select-sm w-32"
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as ReviewStatusFilter)
            }
          >
            <option value="all">すべて</option>
            <option value="todo">未判定</option>
            <option value="suitable">適合</option>
            <option value="unsuitable">不適合</option>
            <option value="uncertain">要確認</option>
          </select>
        </div>
        <div
          ref={listRef}
          className="grid min-h-0 flex-1 gap-2 overflow-auto pr-1"
          onScroll={(event) => {
            const list = event.currentTarget;
            if (
              list.scrollTop + list.clientHeight >= list.scrollHeight - 200 &&
              visibleCount < records.length
            ) {
              setLoadedCount((count) =>
                Math.min(Math.max(count, visibleCount) + 250, records.length),
              );
            }
          }}
        >
          {records.slice(0, visibleCount).map((record) => {
            const isActive = activeRecord?.id === record.id;
            const review = reviews[record.id];

            return (
              <button
                key={record.id}
                ref={isActive ? activeRowRef : undefined}
                className={
                  isActive
                    ? "btn btn-primary grid h-auto min-h-14 w-full grid-cols-[48px_minmax(0,1fr)_64px] items-center justify-start gap-2.5 text-left"
                    : "btn btn-ghost grid h-auto min-h-14 w-full grid-cols-[48px_minmax(0,1fr)_64px] items-center justify-start gap-2.5 text-left"
                }
                onClick={() => onActiveRecordChange(record.id)}
                type="button"
              >
                <span className="grid h-10 w-10 place-items-center rounded-field bg-base-200">
                  <img
                    className="max-h-9 max-w-9 object-contain"
                    src={glyphWikiSvgUrl(record.unicode)}
                    alt={record.glyphText}
                  />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate">{record.entryKana || "-"}</strong>
                  <small className="mt-[3px] block truncate opacity-65">
                    {record.gid} / {record.orgCode} / {record.unicode} / {record.recordsCount} 回
                  </small>
                </span>
                <span
                  className={
                    review?.judgment
                      ? "badge badge-success badge-soft"
                      : "badge badge-ghost"
                  }
                >
                  {review?.judgment ? judgmentLabels[review.judgment] : "未"}
                </span>
              </button>
            );
          })}
          {records.length === 0 ? (
            <p className="p-4 text-sm text-base-content/60">
              条件に一致するデータがありません
            </p>
          ) : null}
          {visibleCount < records.length ? (
            <button
              ref={loadMoreRef}
              className="btn btn-outline btn-sm my-2"
              onClick={() =>
                setLoadedCount((count) =>
                  Math.min(Math.max(count, visibleCount) + 250, records.length),
                )
              }
              type="button"
            >
              {visibleCount} / {records.length} 件表示中・さらに表示
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
