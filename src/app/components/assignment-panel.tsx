import { AssignmentFilters } from "../review-types";

export type AssignmentRangeSuggestion = {
  index: number;
  orgCodeStart: string;
  orgCodeEnd: string;
  groupCount: number;
  recordsCount: number;
};

type AssignmentPanelProps = {
  assignment: AssignmentFilters;
  rangeSplitCount: number;
  rangeSuggestions: AssignmentRangeSuggestion[];
  onAssignmentChange: <K extends keyof AssignmentFilters>(
    key: K,
    value: AssignmentFilters[K],
  ) => void;
  onRangeSelect: (range: AssignmentRangeSuggestion) => void;
  onRangeSplitCountChange: (count: number) => void;
};

export default function AssignmentPanel({
  assignment,
  rangeSplitCount,
  rangeSuggestions,
  onAssignmentChange,
  onRangeSelect,
  onRangeSplitCountChange,
}: AssignmentPanelProps) {
  return (
    <section className="card max-h-[calc(100dvh-2rem)] overflow-hidden border border-base-300 bg-base-100 shadow-sm xl:max-h-[calc(100dvh-8rem)]">
      <div className="card-body gap-3 overflow-auto">
        <h2 className="card-title text-lg">担当範囲</h2>
        <label className="form-control">
          <span className="label-text font-bold">担当</span>
          <input
            className="input input-bordered w-full"
            value={assignment.assignee}
            onChange={(event) =>
              onAssignmentChange("assignee", event.target.value)
            }
            placeholder="担当者名"
          />
        </label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text font-bold">開始 ORGCODE</span>
            <input
              className="input input-bordered w-full"
              value={assignment.orgCodeStart}
              onChange={(event) =>
                onAssignmentChange("orgCodeStart", event.target.value)
              }
              placeholder="0001"
            />
          </label>
          <label className="form-control">
            <span className="label-text font-bold">終了 ORGCODE</span>
            <input
              className="input input-bordered w-full"
              value={assignment.orgCodeEnd}
              onChange={(event) =>
                onAssignmentChange("orgCodeEnd", event.target.value)
              }
              placeholder="9999"
            />
          </label>
        </div>
        <div className="divider my-1" />
        <div className="grid gap-2">
          <label className="form-control">
            <span className="label-text font-bold">担当人数</span>
            <input
              className="input input-bordered w-full"
              inputMode="numeric"
              min={1}
              value={rangeSplitCount}
              onChange={(event) =>
                onRangeSplitCountChange(Number(event.target.value))
              }
            />
          </label>
          <div className="grid gap-2">
            {rangeSuggestions.map((range) => {
              const isSelected =
                assignment.orgCodeStart === range.orgCodeStart &&
                assignment.orgCodeEnd === range.orgCodeEnd;

              return (
                <button
                  key={`${range.orgCodeStart}-${range.orgCodeEnd}`}
                  className={
                    isSelected
                      ? "btn btn-primary h-auto min-h-14 justify-start text-left"
                      : "btn btn-outline h-auto min-h-14 justify-start text-left"
                  }
                  onClick={() => onRangeSelect(range)}
                  type="button"
                >
                  <span className="min-w-0">
                    <strong className="block truncate">
                      {range.index}. {range.orgCodeStart} - {range.orgCodeEnd}
                    </strong>
                    <small className="block opacity-70">
                      {range.groupCount} ORGCODE / {range.recordsCount} RECORDS
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
