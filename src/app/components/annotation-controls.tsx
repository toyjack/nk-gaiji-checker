import {
  GlyphAnnotation,
  GlyphAnnotationCategory,
  GlyphAnnotationImage,
} from "../review-types";
import { annotationCategoryLabels } from "../review-utils";
import { categoryStyles } from "./annotatable-image";

type AnnotationControlsProps = {
  image: GlyphAnnotationImage;
  /** All annotations of the record; only those for `image` are listed. */
  annotations: GlyphAnnotation[];
  drawCategory: GlyphAnnotationCategory;
  onDrawCategoryChange: (category: GlyphAnnotationCategory) => void;
  onHoverChange: (id: string | null) => void;
  onChange: (annotations: GlyphAnnotation[]) => void;
};

const categories = Object.keys(annotationCategoryLabels) as GlyphAnnotationCategory[];

/** Category picker for new rectangles and the list of rectangles on one image. */
export default function AnnotationControls({
  image,
  annotations,
  drawCategory,
  onDrawCategoryChange,
  onHoverChange,
  onChange,
}: AnnotationControlsProps) {
  const imageAnnotations = annotations.filter((a) => a.image === image);

  function changeCategory(id: string, category: GlyphAnnotationCategory) {
    onChange(annotations.map((a) => (a.id === id ? { ...a, category } : a)));
  }

  function removeAnnotation(id: string) {
    onChange(annotations.filter((a) => a.id !== id));
    onHoverChange(null);
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="囲みの分類">
        <span className="mr-1 text-xs text-base-content/60">囲み</span>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="radio"
            aria-checked={drawCategory === category}
            className={
              drawCategory === category
                ? "btn btn-xs btn-active gap-1"
                : "btn btn-xs btn-ghost gap-1 font-normal text-base-content/70"
            }
            onClick={() => onDrawCategoryChange(category)}
          >
            <span
              className={`inline-block h-2.5 w-2.5 rounded-sm border-2 ${categoryStyles[category].box}`}
            />
            {annotationCategoryLabels[category]}
          </button>
        ))}
      </div>

      {imageAnnotations.length > 0 ? (
        <ol className="flex flex-wrap gap-1.5">
          {imageAnnotations.map((annotation, index) => (
            <li
              key={annotation.id}
              className="flex items-center gap-1 rounded-field border border-base-300 py-0.5 pl-1 pr-0.5"
              onMouseEnter={() => onHoverChange(annotation.id)}
              onMouseLeave={() => onHoverChange(null)}
            >
              <span
                className={`badge badge-sm w-6 shrink-0 ${categoryStyles[annotation.category].badge}`}
              >
                {index + 1}
              </span>
              <select
                className="select select-ghost select-xs w-28"
                value={annotation.category}
                onChange={(event) =>
                  changeCategory(annotation.id, event.target.value as GlyphAnnotationCategory)
                }
                aria-label={`囲み${index + 1}の分類`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {annotationCategoryLabels[category]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                onClick={() => removeAnnotation(annotation.id)}
                aria-label={`囲み${index + 1}を削除`}
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-base-content/50">
          分類を選び、画像上をドラッグして問題箇所を囲めます
        </p>
      )}
    </div>
  );
}
