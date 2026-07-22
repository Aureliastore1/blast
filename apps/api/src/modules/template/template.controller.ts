import { Request, Response } from "express";
import * as templateService from "./template.service";

export async function create(req: Request, res: Response) {
  const template = await templateService.createTemplate(req.user!.sub, req.body);
  res.status(201).json({ success: true, data: template });
}

export async function list(req: Request, res: Response) {
  const category = req.query.category as string | undefined;
  const templates = await templateService.listTemplates(req.user!.sub, category);
  res.json({ success: true, data: templates });
}

export async function detail(req: Request, res: Response) {
  const template = await templateService.getTemplate(req.user!.sub, req.params.id);
  res.json({ success: true, data: template });
}

export async function update(req: Request, res: Response) {
  const template = await templateService.updateTemplate(req.user!.sub, req.params.id, req.body);
  res.json({ success: true, data: template });
}

export async function remove(req: Request, res: Response) {
  const result = await templateService.deleteTemplate(req.user!.sub, req.params.id);
  res.json({ success: true, data: result });
}
