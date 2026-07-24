import { RefObject } from "react";
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
        <div className="grid min-h-0 flex-1 gap-2 overflow-auto pr-1">
          {records.slice(0, 500).map((record) => {
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
        </div>
      </div>
    </section>
  );
}
