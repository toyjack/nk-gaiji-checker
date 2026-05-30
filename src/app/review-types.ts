export type GaijiRecordOccurrence = {
  itemId: string;
  jkLid: string;
  entryKana: string;
  volume: string;
  page: string;
  imageUrl: string;
};

export type GaijiRecord = {
  id: string;
  gid: string;
  itemIds: string[];
  entryKana: string;
  pages: string[];
  glyphText: string;
  orgCode: string;
  unicode: string;
  className: string;
  type: string;
  recordsCount: number;
  records: GaijiRecordOccurrence[];
};

export type Judgment = "suitable" | "unsuitable" | "uncertain";

export type ReviewEntry = {
  judgment?: Judgment;
  note: string;
  updatedAt?: string;
};

export type AssignmentFilters = {
  assignee: string;
  orgCodeStart: string;
  orgCodeEnd: string;
  jkLidPrefix?: string;
};

export type SavedWork = {
  version: 1;
  sourceFile: string;
  exportedAt: string;
  assignment: AssignmentFilters;
  reviews: Record<string, ReviewEntry>;
};

export type ReviewStatusFilter = "all" | "todo" | Judgment;

export type ProgressSummary = {
  judged: number;
  suitable: number;
  unsuitable: number;
  uncertain: number;
  remaining: number;
};
