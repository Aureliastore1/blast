import { Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import * as mediaService from "./media.service";

export async function upload(req: Request, res: Response) {
  if (!req.file) throw AppError.badRequest("File tidak ditemukan");
  const media = await mediaService.saveUploadedMedia(req.user!.sub, req.file);
  res.status(201).json({ success: true, data: media });
}

export async function list(req: Request, res: Response) {
  const { page = 1, limit = 20 } = req.query as unknown as { page: number; limit: number };
  const result = await mediaService.listMedia(req.user!.sub, Number(page), Number(limit));
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  const result = await mediaService.deleteMedia(req.user!.sub, req.params.id);
  res.json({ success: true, data: result });
}
