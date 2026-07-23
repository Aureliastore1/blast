import { webcrypto } from "node:crypto";

if (typeof (globalThis as any).crypto === "undefined") {
  (globalThis as any).crypto = webcrypto;
}

