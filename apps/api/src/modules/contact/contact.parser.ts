import * as XLSX from "xlsx";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

const PHONE_TOKEN_REGEX = /(?:\+?62|0)8\d{7,12}|8\d{7,12}/g;

/** Extracts raw phone-number-looking tokens from a free-text blob (manual paste / PDF text). */
export function extractPhoneTokens(text: string): string[] {
  const matches = text.match(PHONE_TOKEN_REGEX);
  return matches ?? [];
}

export function parseManualPaste(text: string): string[] {
  // Support one-per-line as well as comma/semicolon separated input.
  const lines = text
    .split(/[\r\n,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines;
}

export function parseTxt(buffer: Buffer): string[] {
  return parseManualPaste(buffer.toString("utf8"));
}

export function parseCsv(buffer: Buffer): string[] {
  const text = buffer.toString("utf8");
  const rows = text.split(/\r?\n/).filter(Boolean);
  const values: string[] = [];
  for (const row of rows) {
    const cells = row.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    values.push(...cells);
  }
  return values;
}

export function parseXlsx(buffer: Buffer): string[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const values: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
    for (const row of rows) {
      for (const cell of row) {
        if (cell !== undefined && cell !== null && String(cell).trim() !== "") {
          values.push(String(cell).trim());
        }
      }
    }
  }

  return values;
}

export async function parsePdf(buffer: Buffer): Promise<string[]> {
  const data = await pdfParse(buffer);
  return extractPhoneTokens(data.text as string);
}

export type ImportSource = "manual" | "txt" | "csv" | "xlsx" | "pdf";

export async function parseImportFile(source: ImportSource, buffer: Buffer, manualText?: string): Promise<string[]> {
  switch (source) {
    case "manual":
      return parseManualPaste(manualText ?? "");
    case "txt":
      return parseTxt(buffer);
    case "csv":
      return parseCsv(buffer);
    case "xlsx":
      return parseXlsx(buffer);
    case "pdf":
      return parsePdf(buffer);
    default:
      return [];
  }
}
