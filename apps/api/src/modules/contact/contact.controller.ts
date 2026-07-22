import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { AppError } from "@/utils/AppError";
import { recordAudit } from "@/middleware/auditLog";
import * as contactService from "./contact.service";
import { ImportSource } from "./contact.parser";

const EXT_TO_SOURCE: Record<string, ImportSource> = {
  ".txt": "txt",
  ".csv": "csv",
  ".xlsx": "xlsx",
  ".xls": "xlsx",
  ".pdf": "pdf",
};

export async function importManual(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { name, text } = req.body as { name: string; text: string };

  const result = await contactService.importContacts(userId, name, "manual", undefined, text);
  await recordAudit({
    userId,
    action: "IMPORT_CONTACTS",
    entity: "ContactList",
    entityId: result.contactList.id,
    metadata: result.summary,
    req,
  });

  res.status(201).json({ success: true, data: result });
}

export async function importFile(req: Request, res: Response) {
  const userId = req.user!.sub;
  const file = req.file;
  if (!file) throw AppError.badRequest("File tidak ditemukan");

  const source = EXT_TO_SOURCE[path.extname(file.originalname).toLowerCase()];
  if (!source) throw AppError.badRequest("Format file tidak didukung");

  const name = (req.body.name as string) || file.originalname;
  // multer uses diskStorage, so read the persisted file back into a buffer for parsing.
  const buffer = fs.readFileSync(file.path);
  const result = await contactService.importContacts(userId, name, source, buffer, undefined);

  // Import files are transient — safe to remove once parsed into the database.
  fs.unlink(file.path, () => undefined);

  await recordAudit({
    userId,
    action: "IMPORT_CONTACTS",
    entity: "ContactList",
    entityId: result.contactList.id,
    metadata: result.summary,
    req,
  });

  res.status(201).json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { page, limit, search } = req.query as unknown as { page: number; limit: number; search?: string };
  const result = await contactService.listContactLists(userId, page, limit, search);
  res.json({ success: true, data: result });
}

export async function detail(req: Request, res: Response) {
  const result = await contactService.getContactList(req.user!.sub, req.params.id);
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const result = await contactService.deleteContactList(req.user!.sub, req.params.id);
  res.json({ success: true, data: result });
}
