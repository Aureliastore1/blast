import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { CreateTemplateInput, UpdateTemplateInput } from "./template.schema";

const VARIABLE_REGEX = /\{(\w+)\}/g;

function extractVariables(content: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = VARIABLE_REGEX.exec(content))) found.add(match[1]);
  return Array.from(found);
}

export async function createTemplate(userId: string, input: CreateTemplateInput) {
  return prisma.template.create({
    data: { ...input, userId, variables: extractVariables(input.content) },
  });
}

export async function listTemplates(userId: string, category?: string) {
  return prisma.template.findMany({
    where: { userId, ...(category ? { category: category as never } : {}) },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTemplate(userId: string, id: string) {
  const template = await prisma.template.findFirst({ where: { id, userId } });
  if (!template) throw AppError.notFound("Template tidak ditemukan");
  return template;
}

export async function updateTemplate(userId: string, id: string, input: UpdateTemplateInput) {
  await getTemplate(userId, id);
  return prisma.template.update({
    where: { id },
    data: {
      ...input,
      ...(input.content ? { variables: extractVariables(input.content) } : {}),
    },
  });
}

export async function deleteTemplate(userId: string, id: string) {
  await getTemplate(userId, id);
  await prisma.template.delete({ where: { id } });
  return { success: true };
}

/** Renders `{nama}`, `{nomor}`, `{tanggal}`, etc. against a contact/context map. */
export function renderTemplate(content: string, variables: Record<string, string>): string {
  return content.replace(VARIABLE_REGEX, (match, key) => variables[key] ?? match);
}
