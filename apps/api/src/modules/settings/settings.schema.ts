import { z } from "zod";

export const updateSettingsSchema = z.object({
  defaultMinDelaySec: z.coerce.number().min(1).max(90).optional(),
  defaultMaxDelaySec: z.coerce.number().min(1).max(90).optional(),
  maxMessagesPerHour: z.coerce.number().min(1).max(2000).optional(),
  maxRetryAttempts: z.coerce.number().min(0).max(10).optional(),
  autoPauseFailureRate: z.coerce.number().min(0).max(1).optional(),
  notifyOnComplete: z.boolean().optional(),
  notifyOnFailureSpike: z.boolean().optional(),
  theme: z.enum(["dark", "light"]).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});
