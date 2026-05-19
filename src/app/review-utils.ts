import { AssignmentFilters, Judgment } from "./review-types";

export const judgmentLabels: Record<Judgment, string> = {
  suitable: "✅",
  unsuitable: "❌",
  uncertain: "⚠️",
};

export const initialAssignment: AssignmentFilters = {
  assignee: "",
  orgCodeStart: "",
  orgCodeEnd: "",
};

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8",
  });
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
