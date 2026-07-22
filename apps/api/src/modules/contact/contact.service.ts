import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { normalizeAndDedupe } from "@/utils/phoneNumber";
import { ImportSource, parseImportFile } from "./contact.parser";

export const MAX_CONTACTS_PER_LIST = 1000;

export async function importContacts(
  userId: string,
  name: string,
  source: ImportSource,
  fileBuffer: Buffer | undefined,
  manualText: string | undefined
) {
  const rawInputs = await parseImportFile(source, fileBuffer ?? Buffer.alloc(0), manualText);

  if (rawInputs.length === 0) {
    throw AppError.badRequest("Tidak ada nomor yang terdeteksi dari sumber yang diberikan");
  }

  const { results, validNumbers, duplicateCount, invalidCount } = normalizeAndDedupe(rawInputs);

  if (validNumbers.length > MAX_CONTACTS_PER_LIST) {
    throw AppError.badRequest(
      `Maksimal ${MAX_CONTACTS_PER_LIST} nomor per campaign. Ditemukan ${validNumbers.length} nomor valid.`
    );
  }

  const contactList = await prisma.contactList.create({
    data: {
      userId,
      name,
      source,
      totalCount: validNumbers.length,
      contacts: {
        create: results
          .filter((r) => r.isValid && r.normalized)
          .filter((r, idx, arr) => arr.findIndex((x) => x.normalized === r.normalized) === idx)
          .map((r) => ({
            rawInput: r.raw,
            phoneNumber: r.normalized as string,
            isValid: true,
          })),
      },
    },
    include: { _count: { select: { contacts: true } } },
  });

  return {
    contactList,
    summary: {
      totalRaw: rawInputs.length,
      validCount: validNumbers.length,
      duplicateCount,
      invalidCount,
    },
  };
}

export async function listContactLists(userId: string, page: number, limit: number, search?: string) {
  const where = {
    userId,
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.contactList.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { contacts: true } } },
    }),
    prisma.contactList.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getContactList(userId: string, id: string) {
  const list = await prisma.contactList.findFirst({
    where: { id, userId },
    include: { contacts: { orderBy: { createdAt: "asc" }, take: 500 } },
  });
  if (!list) throw AppError.notFound("Daftar kontak tidak ditemukan");
  return list;
}

export async function deleteContactList(userId: string, id: string) {
  const list = await prisma.contactList.findFirst({ where: { id, userId } });
  if (!list) throw AppError.notFound("Daftar kontak tidak ditemukan");
  await prisma.contactList.delete({ where: { id } });
  return { success: true };
}
