/**
 * Encrypted multi-file WhatsApp auth state store.
 *
 * Re-implements Baileys' `useMultiFileAuthState` pattern but encrypts every
 * credential/key file at rest with AES-256-GCM using SESSION_ENCRYPTION_KEY.
 * This satisfies the "session terenkripsi" security requirement — raw
 * Baileys session keys never touch disk in plaintext.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
  initAuthCreds,
  BufferJSON,
} from "@whiskeysockets/baileys";
import { env } from "@/config/env";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(env.SESSION_ENCRYPTION_KEY).digest();
}

function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

function safeFileName(key: string): string {
  return key.replace(/[/\\?%*:|"<>]/g, "_") + ".enc";
}

async function writeEncrypted(filePath: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, BufferJSON.replacer);
  await fs.promises.writeFile(filePath, encrypt(json), "utf8");
}

async function readEncrypted<T>(filePath: string): Promise<T | undefined> {
  try {
    const raw = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(decrypt(raw), BufferJSON.reviver) as T;
  } catch {
    return undefined;
  }
}

export async function useEncryptedAuthState(sessionFolder: string): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  await fs.promises.mkdir(sessionFolder, { recursive: true });

  const credsPath = path.join(sessionFolder, "creds.enc");
  const fileFor = (key: string) => path.join(sessionFolder, safeFileName(key));

  const creds: AuthenticationCreds = (await readEncrypted<AuthenticationCreds>(credsPath)) || initAuthCreds();

  const state: AuthenticationState = {
    creds,
    keys: {
      get: async (type, ids) => {
        const result: { [id: string]: SignalDataTypeMap[typeof type] } = {};
        await Promise.all(
          ids.map(async (id) => {
            const value = await readEncrypted<SignalDataTypeMap[typeof type]>(fileFor(`${type}-${id}`));
            if (value !== undefined) result[id] = value;
          })
        );
        return result;
      },
      set: async (data) => {
        const tasks: Promise<void>[] = [];
        for (const category of Object.keys(data) as Array<keyof typeof data>) {
          const categoryData = data[category] as Record<string, unknown> | undefined;
          if (!categoryData) continue;
          for (const id of Object.keys(categoryData)) {
            const value = categoryData[id];
            const file = fileFor(`${String(category)}-${id}`);
            tasks.push(
              value
                ? writeEncrypted(file, value)
                : fs.promises.unlink(file).catch(() => undefined)
            );
          }
        }
        await Promise.all(tasks);
      },
    },
  };

  const saveCreds = () => writeEncrypted(credsPath, state.creds);

  return { state, saveCreds };
}

/** Permanently removes a user's local session files (used on logout). */
export async function wipeAuthState(sessionFolder: string): Promise<void> {
  await fs.promises.rm(sessionFolder, { recursive: true, force: true });
}
