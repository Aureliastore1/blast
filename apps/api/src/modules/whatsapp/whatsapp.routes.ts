import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { whatsappActionLimiter } from "@/middleware/rateLimiter";
import { asyncHandler } from "@/utils/asyncHandler";
import * as whatsappController from "./whatsapp.controller";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /whatsapp/connect:
 *   post:
 *     tags: [WhatsApp Session]
 *     summary: Start a new WhatsApp QR session for the current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Session initiated — listen on Socket.io event `whatsapp:status` for the QR code
 */
router.post("/connect", whatsappActionLimiter, asyncHandler(whatsappController.connect));

/**
 * @openapi
 * /whatsapp/status:
 *   get:
 *     tags: [WhatsApp Session]
 *     summary: Get the current WhatsApp connection status
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
 *     summary: Logout the connected WhatsApp device and wipe local session
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 */
router.post("/logout", asyncHandler(whatsappController.logout));

export default router;
