import { z } from "zod";

export const manualImportSchema = z.object({
  name: z.string().min(1, "Nama daftar kontak wajib diisi").max(150),
  text: z.string().min(1, "Daftar nomor tidak boleh kosong"),
});

export const listQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ManualImportInput = z.infer<typeof manualImportSchema>;
