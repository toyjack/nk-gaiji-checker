import { readFile } from "node:fs/promises";
import path from "node:path";
import CheckerClient from "./checker-client";
import { GaijiRecord } from "./review-types";

type RawGaijiRecord = {
  "ITEM-ID"?: number | string | null;
  "JK-LID"?: string | null;
  ENTRY_KANA?: string | null;
  VOL?: number | string | null;
  PAGE?: number | string | null;
  GIX_TEXT?: string | null;
  ORGCODE?: string | null;
  UNICODE?: string | null;
  CLASS?: string | null;
  TYPE?: string | null;
};

type RawGaijiGroup = {
  GID?: string | null;
  ORGCODE?: string | null;
  UNICODE?: string | null;
  RECORDS_COUNT?: number | null;
  RECORDS?: RawGaijiRecord[];
};

function normalizeJsonText(text: string) {
  return text.replace(/:\s*NaN\b/g, ": null");
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function uniqueValues(values: unknown[]) {
  return Array.from(
    new Set(values.map((value) => toText(value)).filter((value) => value !== "")),
  );
}

function unicodeToGlyph(unicode: string) {
  const codePoint = Number.parseInt(unicode.replace(/^U\+/i, ""), 16);
  if (!Number.isFinite(codePoint)) {
    return "";
  }

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return "";
  }
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}

async function loadVolumeImageUrls(volume: number) {
  const csvPath = path.join(process.cwd(), "data", `vol_${volume}_image_urls.csv`);
  const text = await readFile(csvPath, "utf8");
  const rows = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/).slice(1);

  return new Map(
    rows.flatMap((row) => {
      const [fileName, imageUrl] = parseCsvLine(row);
      return fileName && imageUrl ? [[fileName, imageUrl] as const] : [];
    }),
  );
}

function imageUrlForOccurrence(
  volume: string,
  page: string,
  volumeOneImageUrls: Map<string, string>,
) {
  if (volume !== "1" || !page) {
    return "";
  }

  return (
    volumeOneImageUrls.get(`${page}.jpg`) ??
    volumeOneImageUrls.get(`(${page}).jpg`) ??
    ""
  );
}

async function loadGaijiCheckerData() {
  const sourceFile = "gaiji-checker-data.json";
  const dataPath = path.join(process.cwd(), "data", sourceFile);
  const [text, volumeOneImageUrls] = await Promise.all([
    readFile(dataPath, "utf8"),
    loadVolumeImageUrls(1),
  ]);
  const groups = JSON.parse(normalizeJsonText(text)) as RawGaijiGroup[];

  const records: GaijiRecord[] = groups.map((group, index) => {
    const occurrences = group.RECORDS ?? [];
    const first = occurrences[0] ?? {};
    const gid = toText(group.GID) || `unknown-${index}`;
    const orgCode = toText(group.ORGCODE) || toText(first.ORGCODE);
    const unicode = toText(group.UNICODE) || toText(first.UNICODE);
    const glyphText = toText(first.GIX_TEXT) || unicodeToGlyph(unicode);
    const itemIds = uniqueValues(occurrences.map((record) => record["ITEM-ID"]));
    const pages = uniqueValues(occurrences.map((record) => record.PAGE));
    const entryKana = uniqueValues(occurrences.map((record) => record.ENTRY_KANA));
    const classes = uniqueValues(occurrences.map((record) => record.CLASS));
    const types = uniqueValues(occurrences.map((record) => record.TYPE));
    const records = occurrences.map((record) => ({
      itemId: toText(record["ITEM-ID"]),
      jkLid: toText(record["JK-LID"]),
      entryKana: toText(record.ENTRY_KANA),
      volume: toText(record.VOL),
      page: toText(record.PAGE),
      imageUrl: imageUrlForOccurrence(
        toText(record.VOL),
        toText(record.PAGE),
        volumeOneImageUrls,
      ),
    }));

    return {
      id: gid,
      gid,
      itemIds,
      entryKana: entryKana.join(" / "),
      pages,
      glyphText,
      orgCode,
      unicode,
      className: classes[0] ?? "",
      type: types[0] ?? "",
      recordsCount: group.RECORDS_COUNT ?? occurrences.length,
      records,
    };
  });

  return { records, sourceFile, sourceFiles: [sourceFile] };
}

export default async function Home() {
  const { records, sourceFile, sourceFiles } = await loadGaijiCheckerData();

  return (
    <CheckerClient
      records={records}
      sourceFile={sourceFile}
      sourceFiles={sourceFiles}
    />
  );
}
