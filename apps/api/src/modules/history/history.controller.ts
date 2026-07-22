import { Request, Response } from "express";
import path from "path";
import { recordAudit } from "@/middleware/auditLog";
import * as historyService from "./history.service";

export async function list(req: Request, res: Response) {
  const { search, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query as unknown as {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
  };
  const result = await historyService.listHistory(req.user!.sub, {
    search,
    status,
    dateFrom,
    dateTo,
    page: Number(page),
    limit: Number(limit),
  });
  res.json({ success: true, data: result });
}

export async function exportExcel(req: Request, res: Response) {
  const userId = req.user!.sub;
  const filePath = await historyService.exportCampaignExcel(userId, req.params.id);
  await recordAudit({ userId, action: "EXPORT_REPORT", entity: "Campaign", entityId: req.params.id, req });
  res.download(filePath, path.basename(filePath));
}

export async function exportPdf(req: Request, res: Response) {
  const userId = req.user!.sub;
  const filePath = await historyService.exportCampaignPdf(userId, req.params.id);
  await recordAudit({ userId, action: "EXPORT_REPORT", entity: "Campaign", entityId: req.params.id, req });
  res.download(filePath, path.basename(filePath));
}
