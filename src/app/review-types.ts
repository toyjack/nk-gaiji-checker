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

export type GlyphAnnotationImage = "gif" | "png";

export type GlyphAnnotationCategory = "shape" | "blurry" | "other";

/** Rectangle marked on a current-glyph image. Coordinates are 0..1, relative to the image content. */
export type GlyphAnnotation = {
  id: string;
  image: GlyphAnnotationImage;
  category: GlyphAnnotationCategory;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AnnotationFilter = "all" | "annotated" | "unannotated";

export type ReviewEntry = {
  judgment?: Judgment;
  note: string;
  annotations?: GlyphAnnotation[];
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
