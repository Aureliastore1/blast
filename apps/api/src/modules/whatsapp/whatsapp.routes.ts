import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { whatsappActionLimiter } from "@/middleware/rateLimiter";
import { asyncHandler } from "@/utils/asyncHandler";
import * as whatsappController from "./whatsapp.controller";
import * as whatsappWebhook from "./whatsapp.webhook";

const router = Router();

/**
 * PUBLIC webhook routes (no auth required)
 */
router.get("/webhook", asyncHandler(whatsappWebhook.verifyWebhook));
router.post("/webhook", asyncHandler(whatsappWebhook.handleWebhook));

/**
 * PROTECTED routes (require authentication)
 */
router.use(requireAuth);

/**
 * @openapi
 * /whatsapp/connect:
 *   post:
 *     tags: [WhatsApp Session]
 *     summary: Initialize Cloud API connection (always connected via credentials)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cloud API status retrieved
 */
router.post("/connect", whatsappActionLimiter, asyncHandler(whatsappController.connect));

/**
 * @openapi
 * /whatsapp/status:
 *   get:
 *     tags: [WhatsApp Session]
 *     summary: Get the current WhatsApp Cloud API connection status
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current connection status }
 */
router.get("/status", asyncHandler(whatsappController.status));

/**
 * @openapi
 * /whatsapp/logout:
 *   post:
 *     tags: [WhatsApp Session]
 *     summary: Logout Cloud API (no-op, credentials managed globally)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 */
router.post("/logout", asyncHandler(whatsappController.logout));

export default router;

