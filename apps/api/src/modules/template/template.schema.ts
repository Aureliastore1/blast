import { z } from "zod";

export const templateCategoryEnum = z.enum(["PROMOSI", "REMINDER", "FOLLOW_UP", "TAGIHAN", "CUSTOM"]);

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(150),
  category: templateCategoryEnum.default("CUSTOM"),
  content: z.string().min(1, "Isi template tidak boleh kosong"),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
