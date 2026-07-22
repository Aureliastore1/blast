import { normalizeIndonesianNumber, normalizeAndDedupe } from "@/utils/phoneNumber";

describe("normalizeIndonesianNumber", () => {
  it("normalizes numbers starting with 0", () => {
    expect(normalizeIndonesianNumber("085735123456").normalized).toBe("6285735123456");
  });

  it("normalizes numbers already starting with +62", () => {
    expect(normalizeIndonesianNumber("+6285735123456").normalized).toBe("6285735123456");
  });

  it("normalizes numbers starting with 62 (no plus)", () => {
    expect(normalizeIndonesianNumber("6285735123456").normalized).toBe("6285735123456");
  });

  it("normalizes bare local numbers starting with 8", () => {
    expect(normalizeIndonesianNumber("85735123456").normalized).toBe("6285735123456");
  });

  it("strips spaces, dashes, and parentheses", () => {
    expect(normalizeIndonesianNumber("0857-3512-3456").normalized).toBe("6285735123456");
    expect(normalizeIndonesianNumber("(0857) 3512 3456").normalized).toBe("6285735123456");
  });

  it("rejects non-Indonesian formatted numbers", () => {
    const result = normalizeIndonesianNumber("12345");
    expect(result.isValid).toBe(false);
  });

  it("rejects empty input", () => {
    expect(normalizeIndonesianNumber("").isValid).toBe(false);
  });
});

describe("normalizeAndDedupe", () => {
  it("deduplicates numbers that normalize to the same value", () => {
    const result = normalizeAndDedupe(["085735123456", "+6285735123456", "6285735123456"]);
    expect(result.validNumbers).toEqual(["6285735123456"]);
    expect(result.duplicateCount).toBe(2);
  });

  it("counts invalid entries separately from duplicates", () => {
    const result = normalizeAndDedupe(["085735123456", "notanumber", "123"]);
    expect(result.validNumbers).toEqual(["6285735123456"]);
    expect(result.invalidCount).toBe(2);
  });
});
