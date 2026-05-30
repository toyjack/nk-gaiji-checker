import Link from "next/link";
import { useMemo, useState } from "react";
import { GaijiRecord, Judgment, ReviewEntry } from "../review-types";
import { judgmentLabels } from "../review-utils";
import ShortcutHints from "./shortcut-hints";

type ActiveRecordPanelProps = {
  activeRecord?: GaijiRecord;
  review?: ReviewEntry;
  onReviewChange: (recordId: string, patch: Partial<ReviewEntry>) => void;
};

function glyphWikiSvgUrl(unicode: string) {
  return `https://glyphwiki.org/glyph/u${unicode.replace("U+", "").toLowerCase()}.svg`;
}

function glyphWikiPageUrl(unicode: string) {
  return `https://glyphwiki.org/wiki/u${unicode.replace("U+", "").toLowerCase()}`;
}

function japanKnowledgeUrl(jkLid: string) {
  return `https://japanknowledge.com/lib/display/?lid=${jkLid}`;
}

function judgmentButtonClass(judgment: Judgment, selected: boolean) {
  if (!selected) {
    return "btn btn-outline";
  }

  if (judgment === "suitable") {
    return "btn btn-success";
  }
  if (judgment === "unsuitable") {
    return "btn btn-error";
  }
  return "btn btn-warning";
}

function recordValue(value: string) {
  return value || "-";
}

function occurrencePageLabel(index: number, total: number) {
  const start = index * 3 + 1;
  const end = Math.min(start + 2, total);
  return `${start}-${end}`;
}

function DetailItem({
  label,
  value,
  href,
  strong = false,
}: {
  label: string;
  value: string | number;
  href?: string;
  strong?: boolean;
}) {
  const displayValue = recordValue(String(value));

  return (
    <div className="min-w-0 border-b border-base-300 py-2">
      <dt className="text-xs font-bold text-base-content/60">{label}</dt>
      <dd
        className={
          strong
            ? "mt-1 truncate text-base font-bold"
            : "mt-1 truncate text-sm"
        }
      >
        {href && displayValue !== "-" ? (
          <Link
            className="link link-primary"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayValue}
          </Link>
        ) : (
          displayValue
        )}
      </dd>
    </div>
  );
}

export default function ActiveRecordPanel({
  activeRecord,
  review,
  onReviewChange,
}: ActiveRecordPanelProps) {
  const [occurrencePageState, setOccurrencePageState] = useState({
    recordId: "",
    page: 0,
  });

  const occurrencePages = useMemo(() => {
    if (!activeRecord) {
      return [];
    }

    return Array.from(
      { length: Math.ceil(activeRecord.records.length / 3) },
      (_, index) => activeRecord.records.slice(index * 3, index * 3 + 3),
    );
  }, [activeRecord]);

  const activeOccurrencePage =
    occurrencePageState.recordId === activeRecord?.id
      ? Math.max(
          0,
          Math.min(occurrencePageState.page, occurrencePages.length - 1),
        )
      : 0;
  const visibleOccurrences = occurrencePages[activeOccurrencePage] ?? [];
  const declaredRecordsCount = activeRecord?.recordsCount ?? 0;

  return (
    <section className="card max-h-[calc(100dvh-2rem)] overflow-hidden border border-base-300 bg-base-100 shadow-sm xl:max-h-[calc(100dvh-8rem)]">
      <div className="card-body overflow-auto">
        {activeRecord ? (
          <>
            <header className="flex gap-3 justify-between">
              <div className="min-w-0">
                <h2 className="mt-1 truncate text-2xl font-bold">
                  {activeRecord.gid}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge badge-outline">
                    ORGCODE {activeRecord.orgCode}
                  </span>
                  <span className="badge badge-outline">
                     {activeRecord.unicode}
                  </span>
                </div>
              </div>
              <div className="stats stats-horizontal shrink-0 border border-base-300 bg-base-100 shadow-none">
                <div className="stat px-4 py-2">
                  <div className="stat-title text-xs">出現回数</div>
                  <div className="stat-value text-xl">{declaredRecordsCount}</div>
                </div>
              </div>
            </header>

            <div className="mt-[18px] grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="grid min-h-[190px] content-center justify-items-center rounded-box border border-base-300 bg-base-200 p-5">
                <span className="text-xs font-bold text-base-content/60">
                  Unicode字形（GlyphWiki）
                </span>
                <Link
                  href={glyphWikiPageUrl(activeRecord.unicode)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    className="max-w-full object-contain"
                    src={glyphWikiSvgUrl(activeRecord.unicode)}
                    alt={activeRecord.glyphText}
                  />
                </Link>
              </div>
              <div className="grid min-h-[190px] content-center justify-items-center rounded-box border border-base-300 bg-base-200 p-5">
                <span className="text-xs font-bold text-base-content/60">
                  現在字形
                </span>
                <img
                  className="h-32 max-w-full object-contain"
                  src={`/images/${activeRecord.orgCode}.gif`}
                  alt={activeRecord.orgCode}
                />
              </div>
            </div>



            <div className="mt-[18px] grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {(Object.keys(judgmentLabels) as Judgment[]).map((judgment) => (
                <button
                  key={judgment}
                  className={judgmentButtonClass(
                    judgment,
                    review?.judgment === judgment,
                  )}
                  onClick={() => onReviewChange(activeRecord.id, { judgment })}
                  type="button"
                >
                  {judgmentLabels[judgment]}
                </button>
              ))}
            </div>

            <label className="form-control mt-4">
              <span className="label-text font-bold">備考</span>
              <textarea
                className="textarea textarea-bordered min-h-28 w-full"
                value={review?.note ?? ""}
                onChange={(event) =>
                  onReviewChange(activeRecord.id, { note: event.target.value })
                }
                placeholder="判定根拠、確認事項、修正案を入力"
              />
            </label>

            <ShortcutHints />


            <section className="mt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold text-base-content/70">
                  RECORDS
                </h3>
                {occurrencePages.length > 1 ? (
                  <div
                    className="tabs tabs-box tabs-sm"
                    role="tablist"
                    aria-label="RECORDS page"
                  >
                    {occurrencePages.map((_, index) => (
                      <button
                        key={index}
                        className={
                          activeOccurrencePage === index
                            ? "tab tab-active"
                            : "tab"
                        }
                        role="tab"
                        aria-selected={activeOccurrencePage === index}
                        onClick={() =>
                          setOccurrencePageState({
                            recordId: activeRecord.id,
                            page: index,
                          })
                        }
                        type="button"
                      >
                        {occurrencePageLabel(
                          index,
                          activeRecord.records.length,
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {visibleOccurrences.length > 0 ? (
                <div className="mt-2 grid grid-cols-1 gap-2.5">
                  {visibleOccurrences.map((occurrence, index) => {
                    const occurrenceNumber = activeOccurrencePage * 3 + index + 1;

                    return (
                      <article
                        key={`${occurrence.jkLid}-${occurrence.itemId}-${occurrenceNumber}`}
                        className="rounded-box border border-base-300 bg-base-200 p-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="badge badge-outline">
                            出現{occurrenceNumber}
                          </span>
                        </div>
                        <dl className="mt-2 grid grid-cols-1 gap-x-3 sm:grid-cols-3">
                          <DetailItem
                            label="ITEM-ID"
                            value={occurrence.itemId}
                          />
                          <DetailItem
                            label="JK-LID"
                            value={occurrence.jkLid}
                            href={japanKnowledgeUrl(occurrence.jkLid)}
                          />
                          <DetailItem
                            label="見出し仮名表記"
                            value={occurrence.entryKana}
                          />
                          <DetailItem label="巻" value={occurrence.volume} />
                          <DetailItem label="ページ" value={occurrence.page} />
                          <DetailItem
                            label="画像"
                            value={occurrence.imageUrl}
                            href={occurrence.imageUrl}
                          />
                        </dl>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-2 rounded-box border border-dashed border-base-300 p-4 text-sm text-base-content/60">
                  RECORDS は空です
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="grid min-h-[360px] place-items-center text-base-content/60">
            表示できるデータがありません
          </div>
        )}
      </div>
    </section>
  );
}
