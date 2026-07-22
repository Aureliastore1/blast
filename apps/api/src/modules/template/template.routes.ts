import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { createTemplateSchema, updateTemplateSchema } from "./template.schema";
import * as templateController from "./template.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /templates:
 *   post:
 *     tags: [Templates]
 *     summary: Create a message template
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, content]
 *             properties:
 *               name: { type: string }
 *               category: { type: string, enum: [PROMOSI, REMINDER, FOLLOW_UP, TAGIHAN, CUSTOM] }
 *               content: { type: string }
 *     responses:
 *       201: { description: Template created }
 *   get:
 *     tags: [Templates]
 *     summary: List templates
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200: { description: Template list }
 */
router.post("/", validate(createTemplateSchema), asyncHandler(templateController.create));
router.get("/", asyncHandler(templateController.list));

/**
 * @openapi
 * /templates/{id}:
 *   get:
 *     tags: [Templates]
 *     summary: Get a template
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Template detail }
 *   put:
 *     tags: [Templates]
 *     summary: Update a template
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Template updated }
 *   delete:
 *     tags: [Templates]
 *     summary: Delete a template
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Deleted }
 */
router.get("/:id", asyncHandler(templateController.detail));
router.put("/:id", validate(updateTemplateSchema), asyncHandler(templateController.update));
router.delete("/:id", asyncHandler(templateController.remove));

export default router;
