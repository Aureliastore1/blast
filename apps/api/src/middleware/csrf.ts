import { doubleCsrf } from "csrf-csrf";
import { env } from "@/config/env";

const {
  invalidCsrfTokenError,
  generateToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,

  cookieName:
    env.NODE_ENV === "production"
      ? "__Host-inaedaa.csrf"
      : "inaedaa.csrf",

  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
  },

  size: 64,

  getSessionIdentifier: (req) => req.ip || "anonymous",
});

export {
  doubleCsrfProtection,
  generateToken,
  validateRequest,
  invalidCsrfTokenError,
};