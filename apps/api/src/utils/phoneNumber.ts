/**
 * Indonesian phone number normalization & validation.
 *
 * Accepts inputs like:
 *   085735123456, +6285735123456, 6285735123456, 85735123456,
 *   with spaces/dashes/parentheses/other junk characters — and normalizes
 *   all of them to the canonical form: 62XXXXXXXXXXX
 */

const MIN_LOCAL_LENGTH = 9; // after the "8" prefix, e.g. 85735123456 -> 8 + 10 digits
const MAX_LOCAL_LENGTH = 13;

export interface NormalizeResult {
  raw: string;
  normalized: string | null;
  isValid: boolean;
  reason?: string;
}

export function normalizeIndonesianNumber(rawInput: string): NormalizeResult {
  const raw = rawInput.trim();

  // Strip everything except digits and a leading plus.
  let cleaned = raw.replace(/[^\d+]/g, "");
  cleaned = cleaned.replace(/(?!^)\+/g, ""); // remove any non-leading plus signs

  if (!cleaned) {
    return { raw, normalized: null, isValid: false, reason: "Nomor kosong" };
  }

  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  // Normalize known prefixes to the bare local form starting with "8".
  if (digits.startsWith("62")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  // else: assume it already starts with "8" (no country/trunk prefix)

  if (!digits.startsWith("8")) {
    return { raw, normalized: null, isValid: false, reason: "Bukan format nomor Indonesia (harus diawali 08/62/8)" };
  }

  if (digits.length < MIN_LOCAL_LENGTH || digits.length > MAX_LOCAL_LENGTH) {
    return { raw, normalized: null, isValid: false, reason: "Panjang nomor tidak valid" };
  }

  if (!/^\d+$/.test(digits)) {
    return { raw, normalized: null, isValid: false, reason: "Mengandung karakter non-angka" };
  }

  const normalized = `62${digits}`;
  return { raw, normalized, isValid: true };
}

export interface DedupeSummary {
  results: NormalizeResult[];
  validNumbers: string[]; // deduped, normalized
  duplicateCount: number;
  invalidCount: number;
}

export function normalizeAndDedupe(rawInputs: string[]): DedupeSummary {
  const results = rawInputs.map(normalizeIndonesianNumber);
  const seen = new Set<string>();
  const validNumbers: string[] = [];
  let duplicateCount = 0;
  let invalidCount = 0;

  for (const r of results) {
    if (!r.isValid || !r.normalized) {
      invalidCount++;
      continue;
    }
    if (seen.has(r.normalized)) {
      duplicateCount++;
      continue;
    }
    seen.add(r.normalized);
    validNumbers.push(r.normalized);
  }

  return { results, validNumbers, duplicateCount, invalidCount };
}
