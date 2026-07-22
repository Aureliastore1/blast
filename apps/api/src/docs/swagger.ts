import swaggerJsdoc from "swagger-jsdoc";
import { env } from "@/config/env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "iNaedaa Blast API",
      version: "1.0.0",
      description:
        "REST API & realtime WebSocket contract for iNaedaa Blast — Smart WhatsApp Campaign Platform. " +
        "All state-changing requests require a valid JWT access token; the WhatsApp connection is a " +
        "self-managed QR session belonging to the authenticated user.",
      contact: { name: "iNaedaa Blast" },
    },
    servers: [{ url: `${env.API_URL ?? "http://localhost:4000"}/api/v1`, description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Authentication", description: "Register, login, refresh, logout" },
      { name: "WhatsApp Session", description: "QR connection, status, device info" },
      { name: "Campaigns", description: "Create, run, monitor campaigns" },
      { name: "Contacts", description: "Import & manage contact lists" },
      { name: "Media", description: "Upload & manage campaign media" },
      { name: "Templates", description: "Reusable message templates" },
      { name: "History", description: "Past campaign records & exports" },
      { name: "Reports", description: "Aggregate delivery/failure analytics" },
      { name: "Settings", description: "Per-user sending defaults" },
      { name: "Security", description: "CSRF token issuance" },
    ],
  },
  apis: [
    "./src/modules/**/*.routes.ts",
    "./dist/modules/**/*.routes.js",
  ],
});
