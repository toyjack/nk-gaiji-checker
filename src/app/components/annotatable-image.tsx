import { PointerEvent, useRef, useState } from "react";
import {
  GlyphAnnotation,
  GlyphAnnotationCategory,
  GlyphAnnotationImage,
} from "../review-types";

type AnnotatableImageProps = {
  src: string;
  alt: string;
  image: GlyphAnnotationImage;
  /** All annotations of the record; only those for `image` are drawn. */
  annotations: GlyphAnnotation[];
  /** Category given to newly drawn rectangles. */
  drawCategory: GlyphAnnotationCategory;
  hoveredId: string | null;
  onChange: (annotations: GlyphAnnotation[]) => void;
  onError?: () => void;
};

type Point = { x: number; y: number };

// Drags smaller than this (fraction of the image) are treated as stray clicks.
const MIN_SIZE = 0.02;
// Displayed image height in rem; matches the GlyphWiki glyph (h-36).
const IMAGE_HEIGHT_REM = 9;

// Literal class names so Tailwind can see them.
export const categoryStyles: Record<
  GlyphAnnotationCategory,
  { box: string; highlight: string; tag: string; badge: string }
> = {
  shape: {
    box: "border-error",
    highlight: "bg-error/25",
    tag: "bg-error text-error-content",
    badge: "badge-error",
  },
  blurry: {
    box: "border-warning",
    highlight: "bg-warning/25",
    tag: "bg-warning text-warning-content",
    badge: "badge-warning",
  },
  other: {
    box: "border-info",
    highlight: "bg-info/25",
    tag: "bg-info text-info-content",
    badge: "badge-info",
  },
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function pointFromEvent(event: PointerEvent<HTMLElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: clamp01((event.clientX - rect.left) / rect.width),
    y: clamp01((event.clientY - rect.top) / rect.height),
  };
}

function rectFromPoints(start: Point, end: Point) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function newAnnotationId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function percentStyle(rect: { x: number; y: number; width: number; height: number }) {
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
  };
}

/** The glyph image with its rectangles drawn on top; drag on it to add one. */
export default function AnnotatableImage({
  src,
  alt,
  image,
  annotations,
  drawCategory,
  hoveredId,
  onChange,
  onError,
}: AnnotatableImageProps) {
  const [naturalSize, setNaturalSize] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);
  // Event handlers read the drag start from a ref: pointer events can arrive before re-render.
  const dragStartRef = useRef<Point | null>(null);
  const [draft, setDraft] = useState<{ start: Point; end: Point } | null>(null);

  const size = naturalSize?.src === src ? naturalSize : null;
  const imageAnnotations = annotations.filter((a) => a.image === image);

  function recordNaturalSize(element: HTMLImageElement) {
    setNaturalSize({
      src,
      width: element.naturalWidth || 1,
      height: element.naturalHeight || 1,
    });
  }

  function cancelDrag() {
    dragStartRef.current = null;
    setDraft(null);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !size) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    dragStartRef.current = point;
    setDraft({ start: point, end: point });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start) {
      return;
    }
    setDraft({ start, end: pointFromEvent(event) });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start) {
      return;
    }
    const rect = rectFromPoints(start, pointFromEvent(event));
    cancelDrag();
    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
      return;
    }
    onChange([
      ...annotations,
      { id: newAnnotationId(), image, category: drawCategory, ...rect },
    ]);
  }

  return (
    <div
      className="relative max-w-full cursor-crosshair touch-none select-none"
      style={
        size
          ? {
              aspectRatio: `${size.width} / ${size.height}`,
              width: `min(100%, ${(IMAGE_HEIGHT_REM * size.width) / size.height}rem)`,
            }
          : undefined
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelDrag}
      title="ドラッグで囲む"
    >
      <img
        className={size ? "absolute inset-0 h-full w-full" : "h-36 max-w-full object-contain"}
        src={src}
        alt={alt}
        draggable={false}
        ref={(element) => {
          // onLoad does not fire for images that finished loading before hydration.
          if (element?.complete && element.naturalWidth && !size) {
            recordNaturalSize(element);
          }
        }}
        onLoad={(event) => recordNaturalSize(event.currentTarget)}
        onError={onError}
      />
      {size
        ? imageAnnotations.map((annotation, index) => {
            const style = categoryStyles[annotation.category];
            return (
              <div
                key={annotation.id}
                className={`pointer-events-none absolute border-2 ${style.box} ${
                  hoveredId === annotation.id ? style.highlight : ""
                }`}
                style={percentStyle(annotation)}
              >
                <span
                  className={`absolute -left-0.5 -top-0.5 -translate-y-full rounded-sm px-1 text-[10px] font-bold leading-4 ${style.tag}`}
                >
                  {index + 1}
                </span>
              </div>
            );
          })
        : null}
      {draft ? (
        <div
          className={`pointer-events-none absolute border-2 border-dashed ${categoryStyles[drawCategory].box}`}
          style={percentStyle(rectFromPoints(draft.start, draft.end))}
        />
      ) : null}
    </div>
  );
}
