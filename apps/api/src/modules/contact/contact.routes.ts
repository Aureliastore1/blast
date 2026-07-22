import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { uploadImportFile } from "@/middleware/upload";
import { asyncHandler } from "@/utils/asyncHandler";
import { manualImportSchema, listQuerySchema } from "./contact.schema";
import * as contactController from "./contact.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /contacts/import/manual:
 *   post:
 *     tags: [Contacts]
 *     summary: Import contacts via manual copy-paste text
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, text]
 *             properties:
 *               name: { type: string }
 *               text: { type: string, description: "Numbers separated by newline/comma" }
 *     responses:
 *       201: { description: Contact list created }
 */
router.post(
  "/import/manual",
  validate(manualImportSchema),
  asyncHandler(contactController.importManual)
);

/**
 * @openapi
 * /contacts/import/file:
 *   post:
 *     tags: [Contacts]
 *     summary: Import contacts from a TXT, CSV, XLSX, or PDF file (max 1000 numbers)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               name: { type: string }
 *     responses:
 *       201: { description: Contact list created }
 */
router.post("/import/file", uploadImportFile.single("file"), asyncHandler(contactController.importFile));

/**
 * @openapi
 * /contacts:
 *   get:
 *     tags: [Contacts]
 *     summary: List contact lists
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated contact lists }
 */
router.get("/", validate(listQuerySchema, "query"), asyncHandler(contactController.list));

/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     tags: [Contacts]
 *     summary: Get a contact list with its contacts
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Contact list detail }
 *   delete:
 *     tags: [Contacts]
 *     summary: Delete a contact list
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.get("/:id", asyncHandler(contactController.detail));
router.delete("/:id", asyncHandler(contactController.remove));

export default router;
