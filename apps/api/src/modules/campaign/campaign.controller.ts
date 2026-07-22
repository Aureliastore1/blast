import { Request, Response } from "express";
import { recordAudit } from "@/middleware/auditLog";
import * as campaignService from "./campaign.service";

export async function create(req: Request, res: Response) {
  const campaign = await campaignService.createCampaign(req.user!.sub, req.body);
  res.status(201).json({ success: true, data: campaign });
}

export async function list(req: Request, res: Response) {
  const { status, search, page, limit } = req.query as unknown as {
    status?: string;
    search?: string;
    page: number;
    limit: number;
  };
  const result = await campaignService.listCampaigns(req.user!.sub, { status, search, page, limit });
  res.json({ success: true, data: result });
}

export async function detail(req: Request, res: Response) {
  const campaign = await campaignService.getCampaign(req.user!.sub, req.params.id);
  res.json({ success: true, data: campaign });
}

export async function start(req: Request, res: Response) {
  const userId = req.user!.sub;
  const campaign = await campaignService.startCampaign(userId, req.params.id);
  await recordAudit({ userId, action: "CAMPAIGN_START", entity: "Campaign", entityId: campaign.id, req });
  res.json({ success: true, data: campaign, message: "Campaign dijalankan" });
}

export async function pause(req: Request, res: Response) {
  const userId = req.user!.sub;
  const campaign = await campaignService.pauseCampaign(userId, req.params.id);
  await recordAudit({ userId, action: "CAMPAIGN_PAUSE", entity: "Campaign", entityId: campaign.id, req });
  res.json({ success: true, data: campaign, message: "Campaign dijeda" });
}

export async function resume(req: Request, res: Response) {
  const userId = req.user!.sub;
  const campaign = await campaignService.startCampaign(userId, req.params.id);
  await recordAudit({ userId, action: "CAMPAIGN_RESUME", entity: "Campaign", entityId: campaign.id, req });
  res.json({ success: true, data: campaign, message: "Campaign dilanjutkan" });
}

export async function cancel(req: Request, res: Response) {
  const userId = req.user!.sub;
  const campaign = await campaignService.cancelCampaign(userId, req.params.id);
  await recordAudit({ userId, action: "CAMPAIGN_CANCEL", entity: "Campaign", entityId: campaign.id, req });
  res.json({ success: true, data: campaign, message: "Campaign dibatalkan" });
}

export async function progress(req: Request, res: Response) {
  const result = await campaignService.getCampaignProgress(req.user!.sub, req.params.id);
  res.json({ success: true, data: result });
}
