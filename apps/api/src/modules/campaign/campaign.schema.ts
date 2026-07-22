import { z } from "zod";

export const delayPresetEnum = z.enum([
  "CUSTOM",
  "RANGE_1_5",
  "RANGE_5_10",
  "RANGE_10_20",
  "RANGE_20_45",
  "RANGE_45_90",
]);

export const createCampaignSchema = z
  .object({
    name: z.string().min(1, "Nama campaign wajib diisi").max(150),
    contactListId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
    mediaFileId: z.string().uuid().optional(),
    messageBody: z.string().min(1, "Isi pesan wajib diisi"),
    delayPreset: delayPresetEnum.default("RANGE_5_10"),
    minDelaySec: z.coerce.number().min(1).max(90).optional(),
    maxDelaySec: z.coerce.number().min(1).max(90).optional(),
    maxPerHour: z.coerce.number().min(1).max(2000).default(120),
  })
  .refine(
    (data) =>
      data.delayPreset !== "CUSTOM" ||
      (data.minDelaySec !== undefined && data.maxDelaySec !== undefined && data.minDelaySec <= data.maxDelaySec),
    { message: "Untuk delay custom, minDelaySec dan maxDelaySec wajib diisi dan min <= max", path: ["minDelaySec"] }
  );

export const listCampaignQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
