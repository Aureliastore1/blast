import { webcrypto } from "node:crypto";

if (typeof (globalThis as any).crypto === "undefined") {
  // @ts-expect-error -- Node's webcrypto implements the standard Web Crypto API
  globalThis.crypto = webcrypto;
}

