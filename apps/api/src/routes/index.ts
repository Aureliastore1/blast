import { Router } from "express";
import authRoutes from "@/modules/auth/auth.routes";
import whatsappRoutes from "@/modules/whatsapp/whatsapp.routes";
import campaignRoutes from "@/modules/campaign/campaign.routes";
import contactRoutes from "@/modules/contact/contact.routes";
import mediaRoutes from "@/modules/media/media.routes";
import templateRoutes from "@/modules/template/template.routes";
import historyRoutes from "@/modules/history/history.routes";
import reportRoutes from "@/modules/report/report.routes";
import settingsRoutes from "@/modules/settings/settings.routes";
import { generateCsrfToken } from "@/middleware/csrf";

const router = Router();

/**
 * @openapi
 * /csrf-token:
 *   get:
 *     tags: [Security]
 *     summary: Get a CSRF token (also set as readable cookie)
 *     responses:
 *       200: { description: CSRF token issued }
 */
router.get("/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ success: true, data: { csrfToken: token } });
});

router.use("/auth", authRoutes);
router.use("/whatsapp", whatsappRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/contacts", contactRoutes);
router.use("/media", mediaRoutes);
router.use("/templates", templateRoutes);
router.use("/history", historyRoutes);
router.use("/reports", reportRoutes);
router.use("/settings", settingsRoutes);

export default router;
