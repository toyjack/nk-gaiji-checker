import {
  AssignmentFilters,
  GaijiRecord,
  GlyphAnnotation,
  GlyphAnnotationCategory,
  Judgment,
  ReviewEntry,
} from "./review-types";

export const annotationCategoryLabels: Record<GlyphAnnotationCategory, string> = {
  shape: "形状が異なる",
  blurry: "不鮮明",
  other: "その他",
};

function isAnnotationCategory(value: unknown): value is GlyphAnnotationCategory {
  return typeof value === "string" && value in annotationCategoryLabels;
}

function isUnitNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function sanitizeAnnotations(value: unknown): GlyphAnnotation[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.flatMap((item): GlyphAnnotation[] => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const a = item as Record<string, unknown>;
    if (
      typeof a.id !== "string" ||
      (a.image !== "gif" && a.image !== "png") ||
      !isUnitNumber(a.x) ||
      !isUnitNumber(a.y) ||
      !isUnitNumber(a.width) ||
      !isUnitNumber(a.height)
    ) {
      return [];
    }
    // Annotations without a known category (e.g. saved before categories existed) become "other".
    return [
      {
        id: a.id,
        image: a.image,
        category: isAnnotationCategory(a.category) ? a.category : "other",
        x: a.x,
        y: a.y,
        width: Math.min(a.width, 1 - a.x),
        height: Math.min(a.height, 1 - a.y),
      },
    ];
  });
}

export function sanitizeReviews(value: object): Record<string, ReviewEntry> {
  const result: Record<string, ReviewEntry> = {};
  for (const [recordId, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const entry: ReviewEntry = { ...(raw as ReviewEntry) };
    const annotations = sanitizeAnnotations(entry.annotations);
    if (annotations) {
      entry.annotations = annotations;
    } else {
      delete entry.annotations;
    }
    result[recordId] = entry;
  }
  return result;
}

export const judgmentLabels: Record<Judgment, string> = {
  suitable: "✅",
  unsuitable: "❌",
  uncertain: "⚠️",
};

export const judgmentTextLabels: Record<Judgment, string> = {
  suitable: "適合",
  unsuitable: "不適合",
  uncertain: "要確認",
};

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function formatAnnotation(annotation: GlyphAnnotation) {
  const n = (value: number) => value.toFixed(3);
  return `${annotation.image.toUpperCase()}:${annotationCategoryLabels[annotation.category]}(x=${n(annotation.x)},y=${n(annotation.y)},w=${n(annotation.width)},h=${n(annotation.height)})`;
}

/** One row per record in `records`, with its judgment, note and annotations. */
export function buildResultCsv(
  records: GaijiRecord[],
  reviews: Record<string, ReviewEntry>,
) {
  const categories = Object.keys(annotationCategoryLabels) as GlyphAnnotationCategory[];
  const header = [
    "GID",
    "ORGCODE",
    "UNICODE",
    "見出し仮名表記",
    "出現回数",
    "判定",
    "備考",
    "囲み数",
    ...categories.map((category) => annotationCategoryLabels[category]),
    "囲み詳細",
    "更新日時",
  ];

  const rows = records.map((record) => {
    const review = reviews[record.id];
    const annotations = review?.annotations ?? [];
    return [
      record.gid,
      record.orgCode,
      record.unicode,
      record.entryKana,
      record.recordsCount,
      review?.judgment ? judgmentTextLabels[review.judgment] : "",
      review?.note ?? "",
      annotations.length,
      ...categories.map(
        (category) => annotations.filter((a) => a.category === category).length,
      ),
      annotations.map(formatAnnotation).join("; "),
      review?.updatedAt ?? "",
    ];
  });

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  // The BOM lets Excel detect UTF-8 so Japanese text is not garbled.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(filename, blob);
}

export const initialAssignment: AssignmentFilters = {
  assignee: "",
  orgCodeStart: "",
  orgCodeEnd: "",
  jkLidPrefix: "https://japanknowledge.com/lib/display/?lid=",
};

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  downloadBlob(filename, blob);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "_",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function sanitizeFilenamePart(value: string) {
  return value.trim().replace(/[\\/:*?"<>|\s]+/g, "_") || "unknown";
}
