import { Queue } from "bullmq";
import { redisConnection } from "@/config/redis";

export interface CampaignJobData {
  campaignId: string;
  messageId: string;
  userId: string;
  phoneNumber: string;
  content: string;
  mediaPath?: string;
  mediaType?: "IMAGE" | "VIDEO" | "DOCUMENT";
  attempt: number;
  // Cloud API template mode
  templateName?: string;
  templateLanguage?: string;
  templateParams?: Record<string, string>;
}

export const CAMPAIGN_QUEUE_NAME = "campaign-send-queue";

export const campaignQueue = new Queue<CampaignJobData>(CAMPAIGN_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: { count: 1000, age: 24 * 3600 },
    removeOnFail: { count: 5000, age: 7 * 24 * 3600 },
  },
});

/** Enqueue a single message send with an optional delay (ms) before processing. */
export async function enqueueMessage(data: CampaignJobData, delayMs: number) {
  return campaignQueue.add("send-message", data, {
    delay: delayMs,
    jobId: `${data.messageId}-a${data.attempt}`,
  });
}

/** Removes all pending (not-yet-processed) jobs belonging to a campaign — used on pause/cancel. */
export async function drainCampaignJobs(campaignId: string) {
  const jobs = await campaignQueue.getJobs(["delayed", "waiting"]);
  await Promise.all(
    jobs
      .filter((job) => job.data.campaignId === campaignId)
      .map((job) => job.remove().catch(() => undefined))
  );
}

