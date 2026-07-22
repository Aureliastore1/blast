import { doubleCsrf } from "csrf-csrf";
import { env } from "@/config/env";

/**
 * Double-submit-cookie CSRF protection.
 * The frontend must read the `x-csrf-token` cookie value (non-httpOnly) and
 * echo it back in the `X-CSRF-Token` header on state-changing requests.
 */
export const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  cookieName: env.NODE_ENV === "production" ? "__Host-inaedaa.csrf" : "inaedaa.csrf",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  getSessionIdentifier: (req) => req.ip || "anonymous",
});
