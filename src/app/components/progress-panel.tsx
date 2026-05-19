import { ChangeEvent } from "react";
import { ProgressSummary } from "../review-types";

type ProgressPanelProps = {
  assignedCount: number;
  importMessage: string;
  progress: ProgressSummary;
  sourceFiles: string[];
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function ProgressPanel({
  assignedCount,
  importMessage,
  progress,
  sourceFiles,
  onExport,
  onImport,
}: ProgressPanelProps) {
  return (
    <section className="card max-h-[calc(100dvh-2rem)] overflow-hidden border border-base-300 bg-base-100 shadow-sm xl:max-h-[calc(100dvh-8rem)]">
      <div className="card-body gap-4 overflow-auto">
        <h2 className="card-title text-lg">作業結果</h2>
        <div className="stats stats-vertical border border-base-300 bg-base-200 shadow-sm">
          <div className="stat p-3">
            <div className="stat-title text-xs">範囲内</div>
            <div className="stat-value text-2xl">{assignedCount.toLocaleString()}</div>
          </div>
          <div className="stat p-3">
            <div className="stat-title text-xs">判定済み</div>
            <div className="stat-value text-2xl">{progress.judged.toLocaleString()}</div>
          </div>
          <div className="stat p-3">
            <div className="stat-title text-xs">残り</div>
            <div className="stat-value text-2xl">{progress.remaining.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-success badge-soft">適合 {progress.suitable}</span>
          <span className="badge badge-error badge-soft">
            不適合 {progress.unsuitable}
          </span>
          <span className="badge badge-warning badge-soft">
            要確認 {progress.uncertain}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-primary" type="button" onClick={onExport}>
            JSON 出力
          </button>
          <label className="btn btn-outline">
            JSON 読み込み
            <input
              accept="application/json"
              className="hidden"
              type="file"
              onChange={onImport}
            />
          </label>
        </div>
        {importMessage ? <p className="text-sm text-base-content/70">{importMessage}</p> : null}
        <p className="text-xs leading-relaxed text-base-content/60">
          利用可能なデータソース：{sourceFiles.join(", ")}
        </p>
      </div>
    </section>
  );
}
