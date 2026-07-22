import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import * as historyController from "./history.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /history:
 *   get:
 *     tags: [History]
 *     summary: List campaign history with filters (name/number/date/status)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated history }
 */
router.get("/", asyncHandler(historyController.list));

/**
 * @openapi
 * /history/{id}/export/excel:
 *   get:
 *     tags: [History]
 *     summary: Export a campaign's detailed report as Excel (.xlsx)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Excel file stream }
 */
router.get("/:id/export/excel", asyncHandler(historyController.exportExcel));

/**
 * @openapi
 * /history/{id}/export/pdf:
 *   get:
 *     tags: [History]
 *     summary: Export a campaign's detailed report as PDF
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: PDF file stream }
 */
router.get("/:id/export/pdf", asyncHandler(historyController.exportPdf));

export default router;
