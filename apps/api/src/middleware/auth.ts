import { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { verifyAccessToken, AccessTokenPayload } from "@/utils/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

  if (!token) {
    return next(AppError.unauthorized("Token akses tidak ditemukan"));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(AppError.unauthorized("Token akses tidak valid atau sudah kedaluwarsa"));
  }
}

export function requireRole(...roles: Array<"ADMIN" | "USER">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };
}
