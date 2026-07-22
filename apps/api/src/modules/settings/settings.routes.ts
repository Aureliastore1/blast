import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { updateSettingsSchema, updateProfileSchema, changePasswordSchema } from "./settings.schema";
import * as settingsController from "./settings.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get sending defaults (delay, rate limit, retry, auto-pause threshold)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User settings }
 *   put:
 *     tags: [Settings]
 *     summary: Update sending defaults
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated settings }
 */
router.get("/", asyncHandler(settingsController.getSettings));
router.put("/", validate(updateSettingsSchema), asyncHandler(settingsController.updateSettings));

/**
 * @openapi
 * /settings/profile:
 *   get:
 *     tags: [Settings]
 *     summary: Get current user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile }
 *   put:
 *     tags: [Settings]
 *     summary: Update profile (name, phone, avatar)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated profile }
 */
router.get("/profile", asyncHandler(settingsController.getProfile));
router.put("/profile", validate(updateProfileSchema), asyncHandler(settingsController.updateProfile));

/**
 * @openapi
 * /settings/password:
 *   put:
 *     tags: [Settings]
 *     summary: Change account password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Password changed }
 */
router.put("/password", validate(changePasswordSchema), asyncHandler(settingsController.changePassword));

export default router;
