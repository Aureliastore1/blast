import { Request } from "express";
import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { logger } from "@/config/logger";

interface AuditParams {
  userId?: string | null;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  req?: Request;
}

export async function recordAudit({ userId, action, entity, entityId, metadata, req }: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        entity,
        entityId,
        metadata,
        ipAddress: req?.ip,
        userAgent: req?.headers["user-agent"],
      },
    });
  } catch (err) {
    // Audit logging must never break the main request flow.
    logger.error({ err }, "Failed to record audit log");
  }
}
