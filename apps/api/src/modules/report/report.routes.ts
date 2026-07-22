import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import * as reportController from "./report.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Dashboard summary stat cards
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Summary stats }
 */
router.get("/summary", asyncHandler(reportController.summary));

/**
 * @openapi
 * /reports/daily:
 *   get:
 *     tags: [Reports]
 *     summary: Daily sent/failed counts for the last N days
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: days, schema: { type: integer, default: 14 } }]
 *     responses:
 *       200: { description: Daily series }
 */
router.get("/daily", asyncHandler(reportController.daily));

/**
 * @openapi
 * /reports/monthly:
 *   get:
 *     tags: [Reports]
 *     summary: Monthly campaign/sent/failed counts for the last N months
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: months, schema: { type: integer, default: 6 } }]
 *     responses:
 *       200: { description: Monthly series }
 */
router.get("/monthly", asyncHandler(reportController.monthly));

/**
 * @openapi
 * /reports/rates:
 *   get:
 *     tags: [Reports]
 *     summary: Overall delivery/failure/success rate across all campaigns
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Rate metrics }
 */
router.get("/rates", asyncHandler(reportController.rates));

export default router;
