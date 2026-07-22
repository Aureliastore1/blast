import dayjs from "dayjs";
import { prisma } from "@/config/prisma";
import { CampaignStatus } from "@prisma/client";

export async function getSummary(userId: string) {
  const [activeCampaigns, totalContacts, sentToday, failedToday, totalMedia, totalTemplates] = await Promise.all([
    prisma.campaign.count({ where: { userId, status: CampaignStatus.RUNNING } }),
    prisma.contact.count({ where: { contactList: { userId } } }),
    prisma.message.count({
      where: {
        campaign: { userId },
        status: "SENT",
        sentAt: { gte: dayjs().startOf("day").toDate() },
      },
    }),
    prisma.message.count({
      where: {
        campaign: { userId },
        status: "FAILED",
        failedAt: { gte: dayjs().startOf("day").toDate() },
      },
    }),
    prisma.mediaFile.count({ where: { userId } }),
    prisma.template.count({ where: { userId } }),
  ]);

  const aggregate = await prisma.campaign.aggregate({
    where: { userId },
    _sum: { sentCount: true, failedCount: true, totalContacts: true },
  });

  const totalSent = aggregate._sum.sentCount ?? 0;
  const totalFailed = aggregate._sum.failedCount ?? 0;
  const totalProcessed = totalSent + totalFailed;
  const deliveryRate = totalProcessed > 0 ? Number(((totalSent / totalProcessed) * 100).toFixed(1)) : 0;

  return {
    activeCampaigns,
    totalContacts,
    sentToday,
    failedToday,
    deliveryRate,
    totalMedia,
    totalTemplates,
    totalSentAllTime: totalSent,
    totalFailedAllTime: totalFailed,
  };
}

export async function getDailyReport(userId: string, days = 14) {
  const from = dayjs().subtract(days - 1, "day").startOf("day").toDate();

  const messages = await prisma.message.findMany({
    where: { campaign: { userId }, createdAt: { gte: from } },
    select: { status: true, createdAt: true, sentAt: true, failedAt: true },
  });

  const buckets = new Map<string, { sent: number; failed: number }>();
  for (let i = 0; i < days; i++) {
    const key = dayjs(from).add(i, "day").format("YYYY-MM-DD");
    buckets.set(key, { sent: 0, failed: 0 });
  }

  for (const m of messages) {
    const dateRef = m.sentAt ?? m.failedAt ?? m.createdAt;
    const key = dayjs(dateRef).format("YYYY-MM-DD");
    if (!buckets.has(key)) continue;
    const bucket = buckets.get(key)!;
    if (m.status === "SENT" || m.status === "DELIVERED" || m.status === "READ") bucket.sent++;
    if (m.status === "FAILED") bucket.failed++;
  }

  return Array.from(buckets.entries()).map(([date, counts]) => ({ date, ...counts }));
}

export async function getMonthlyReport(userId: string, months = 6) {
  const from = dayjs().subtract(months - 1, "month").startOf("month").toDate();

  const campaigns = await prisma.campaign.findMany({
    where: { userId, createdAt: { gte: from } },
    select: { createdAt: true, sentCount: true, failedCount: true },
  });

  const buckets = new Map<string, { campaigns: number; sent: number; failed: number }>();
  for (let i = 0; i < months; i++) {
    const key = dayjs(from).add(i, "month").format("YYYY-MM");
    buckets.set(key, { campaigns: 0, sent: 0, failed: 0 });
  }

  for (const c of campaigns) {
    const key = dayjs(c.createdAt).format("YYYY-MM");
    if (!buckets.has(key)) continue;
    const bucket = buckets.get(key)!;
    bucket.campaigns++;
    bucket.sent += c.sentCount;
    bucket.failed += c.failedCount;
  }

  return Array.from(buckets.entries()).map(([month, counts]) => ({ month, ...counts }));
}

export async function getRates(userId: string) {
  const aggregate = await prisma.campaign.aggregate({
    where: { userId },
    _sum: { sentCount: true, failedCount: true, skippedCount: true, totalContacts: true },
    _count: { _all: true },
  });

  const sent = aggregate._sum.sentCount ?? 0;
  const failed = aggregate._sum.failedCount ?? 0;
  const skipped = aggregate._sum.skippedCount ?? 0;
  const processed = sent + failed + skipped;

  return {
    totalCampaigns: aggregate._count._all,
    successRate: processed > 0 ? Number(((sent / processed) * 100).toFixed(1)) : 0,
    failureRate: processed > 0 ? Number(((failed / processed) * 100).toFixed(1)) : 0,
    deliveryRate: processed > 0 ? Number(((sent / processed) * 100).toFixed(1)) : 0,
  };
}
