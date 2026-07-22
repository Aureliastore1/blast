import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import dayjs from "dayjs";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";

export interface HistoryFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export async function listHistory(userId: string, filters: HistoryFilters) {
  const where = {
    userId,
    ...(filters.status ? { status: filters.status as never } : {}),
    ...(filters.search ? { name: { contains: filters.search, mode: "insensitive" as const } } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          createdAt: {
            ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: { contactList: { select: { name: true } }, mediaFile: { select: { originalName: true } } },
    }),
    prisma.campaign.count({ where }),
  ]);

  const withDuration = items.map((c) => ({
    ...c,
    durationSeconds:
      c.startedAt && c.finishedAt ? Math.round((c.finishedAt.getTime() - c.startedAt.getTime()) / 1000) : null,
  }));

  return { items: withDuration, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
}

async function getCampaignForExport(userId: string, id: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId },
    include: { messages: true, contactList: { select: { name: true } } },
  });
  if (!campaign) throw AppError.notFound("Campaign tidak ditemukan");
  return campaign;
}

export async function exportCampaignExcel(userId: string, id: string): Promise<string> {
  const campaign = await getCampaignForExport(userId, id);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan Campaign");

  sheet.addRow(["Laporan Campaign — iNaedaa Blast"]);
  sheet.addRow(["Nama Campaign", campaign.name]);
  sheet.addRow(["Status", campaign.status]);
  sheet.addRow(["Total Nomor", campaign.totalContacts]);
  sheet.addRow(["Berhasil", campaign.sentCount]);
  sheet.addRow(["Gagal", campaign.failedCount]);
  sheet.addRow([]);

  sheet.addRow(["Nomor", "Status", "Percobaan", "Terkirim Pada", "Error"]).font = { bold: true };
  campaign.messages.forEach((m) => {
    sheet.addRow([m.phoneNumber, m.status, m.attempts, m.sentAt?.toISOString() ?? "", m.errorMessage ?? ""]);
  });

  sheet.columns.forEach((col) => (col.width = 22));

  const exportDir = path.resolve(env.UPLOAD_DIR, "exports");
  fs.mkdirSync(exportDir, { recursive: true });
  const fileName = `campaign-${campaign.id}-${Date.now()}.xlsx`;
  const filePath = path.join(exportDir, fileName);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

export async function exportCampaignPdf(userId: string, id: string): Promise<string> {
  const campaign = await getCampaignForExport(userId, id);

  const exportDir = path.resolve(env.UPLOAD_DIR, "exports");
  fs.mkdirSync(exportDir, { recursive: true });
  const fileName = `campaign-${campaign.id}-${Date.now()}.pdf`;
  const filePath = path.join(exportDir, fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text("Laporan Campaign — iNaedaa Blast", { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Nama Campaign : ${campaign.name}`);
    doc.text(`Status        : ${campaign.status}`);
    doc.text(`Dibuat        : ${dayjs(campaign.createdAt).format("DD/MM/YYYY HH:mm")}`);
    doc.text(`Total Nomor   : ${campaign.totalContacts}`);
    doc.text(`Berhasil      : ${campaign.sentCount}`);
    doc.text(`Gagal         : ${campaign.failedCount}`);
    doc.text(`Dilewati      : ${campaign.skippedCount}`);
    doc.moveDown();

    doc.fontSize(13).text("Detail Pesan", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(9);

    campaign.messages.slice(0, 500).forEach((m) => {
      doc.text(`${m.phoneNumber}  |  ${m.status}  |  percobaan ${m.attempts}  |  ${m.errorMessage ?? "-"}`);
    });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });

  return filePath;
}
