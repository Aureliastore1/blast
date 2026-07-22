import { Request, Response } from "express";
import * as reportService from "./report.service";

export async function summary(req: Request, res: Response) {
  const data = await reportService.getSummary(req.user!.sub);
  res.json({ success: true, data });
}

export async function daily(req: Request, res: Response) {
  const days = Number(req.query.days) || 14;
  const data = await reportService.getDailyReport(req.user!.sub, days);
  res.json({ success: true, data });
}

export async function monthly(req: Request, res: Response) {
  const months = Number(req.query.months) || 6;
  const data = await reportService.getMonthlyReport(req.user!.sub, months);
  res.json({ success: true, data });
}

export async function rates(req: Request, res: Response) {
  const data = await reportService.getRates(req.user!.sub);
  res.json({ success: true, data });
}
