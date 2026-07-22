import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { createCampaignSchema, listCampaignQuerySchema } from "./campaign.schema";
import * as campaignController from "./campaign.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /campaigns:
 *   post:
 *     tags: [Campaigns]
 *     summary: Create a new campaign (draft)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, contactListId, messageBody]
 *             properties:
 *               name: { type: string }
 *               contactListId: { type: string }
 *               templateId: { type: string }
 *               mediaFileId: { type: string }
 *               messageBody: { type: string }
 *               delayPreset: { type: string, enum: [CUSTOM, RANGE_1_5, RANGE_5_10, RANGE_10_20, RANGE_20_45, RANGE_45_90] }
 *               minDelaySec: { type: integer }
 *               maxDelaySec: { type: integer }
 *               maxPerHour: { type: integer }
 *     responses:
 *       201: { description: Campaign created }
 *   get:
 *     tags: [Campaigns]
 *     summary: List campaigns
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated campaign list }
 */
router.post("/", validate(createCampaignSchema), asyncHandler(campaignController.create));
router.get("/", validate(listCampaignQuerySchema, "query"), asyncHandler(campaignController.list));

/**
 * @openapi
 * /campaigns/{id}:
 *   get:
 *     tags: [Campaigns]
 *     summary: Get campaign detail
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Campaign detail }
 */
router.get("/:id", asyncHandler(campaignController.detail));

/**
 * @openapi
 * /campaigns/{id}/start:
 *   post:
 *     tags: [Campaigns]
 *     summary: Start (or resume) sending a campaign — enqueues messages onto the send queue
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Campaign started }
 */
router.post("/:id/start", asyncHandler(campaignController.start));

/**
 * @openapi
 * /campaigns/{id}/pause:
 *   post:
 *     tags: [Campaigns]
 *     summary: Pause a running campaign
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Campaign paused }
 */
router.post("/:id/pause", asyncHandler(campaignController.pause));

/**
 * @openapi
 * /campaigns/{id}/resume:
 *   post:
 *     tags: [Campaigns]
 *     summary: Resume a paused campaign
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Campaign resumed }
 */
router.post("/:id/resume", asyncHandler(campaignController.resume));

/**
 * @openapi
 * /campaigns/{id}/cancel:
 *   post:
 *     tags: [Campaigns]
 *     summary: Cancel a campaign
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Campaign cancelled }
 */
router.post("/:id/cancel", asyncHandler(campaignController.cancel));

/**
 * @openapi
 * /campaigns/{id}/progress:
 *   get:
 *     tags: [Campaigns]
 *     summary: Get realtime-ish progress snapshot (also broadcast live via Socket.io `campaign:progress`)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Progress snapshot }
 */
router.get("/:id/progress", asyncHandler(campaignController.progress));

export default router;
