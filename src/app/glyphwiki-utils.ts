export type GlyphSource = "g" | "j" | "k" | "t" | "v";

export const glyphSourceLabels: Record<GlyphSource, string> = {
  j: "J源",
  g: "G源",
  t: "T源",
  k: "K源",
  v: "V源",
};

export function glyphWikiSvgUrl(unicode: string, source?: GlyphSource) {
  const base = `u${unicode.replace("U+", "").toLowerCase()}`;
  return `https://glyphwiki.org/glyph/${source ? `${base}-${source}` : base}.svg`;
}

export function glyphWikiPageUrl(unicode: string, source?: GlyphSource) {
  const base = `u${unicode.replace("U+", "").toLowerCase()}`;
  return `https://glyphwiki.org/wiki/${source ? `${base}-${source}` : base}`;
}
