import bcrypt from "bcryptjs";
import { prisma } from "@/config/prisma";
import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { sanitizeUser } from "@/modules/auth/auth.service";

export async function getSettings(userId: string) {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return settings;
}

export async function updateSettings(userId: string, data: Record<string, unknown>) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User tidak ditemukan");
  return sanitizeUser(user);
}

export async function updateProfile(userId: string, data: Record<string, unknown>) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return sanitizeUser(user);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User tidak ditemukan");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw AppError.badRequest("Password saat ini salah");

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Revoke all existing refresh tokens for security after a password change.
  await prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });

  return { success: true };
}
