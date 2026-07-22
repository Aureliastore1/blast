import { Request, Response } from "express";
import * as settingsService from "./settings.service";

export async function getSettings(req: Request, res: Response) {
  const data = await settingsService.getSettings(req.user!.sub);
  res.json({ success: true, data });
}

export async function updateSettings(req: Request, res: Response) {
  const data = await settingsService.updateSettings(req.user!.sub, req.body);
  res.json({ success: true, data });
}

export async function getProfile(req: Request, res: Response) {
  const data = await settingsService.getProfile(req.user!.sub);
  res.json({ success: true, data });
}

export async function updateProfile(req: Request, res: Response) {
  const data = await settingsService.updateProfile(req.user!.sub, req.body);
  res.json({ success: true, data });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const data = await settingsService.changePassword(req.user!.sub, currentPassword, newPassword);
  res.json({ success: true, data, message: "Password berhasil diubah" });
}
