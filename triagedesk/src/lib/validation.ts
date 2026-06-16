import { z } from "zod";

// Guard #1: never trust incoming data. Reject empty/oversized input
export const TriageInput = z.object({
  sender: z.string().trim().min(1, "Sender required").max(120),
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"), // cap = cost control + abuse prevention
});

export type TriageInputType = z.infer<typeof TriageInput>;

// Guard: shape we expect BACK from the model. If it doesn't match, we don't trust it.
export const AIResult = z.object({
  category: z.enum(["Billing", "Technical", "General", "Complaint"]),
  urgency: z.enum(["Low", "Medium", "High"]),
  sentiment: z.enum(["Positive", "Neutral", "Negative"]),
  draftReply: z.string().min(1).max(1500),
  confidence: z.number().min(0).max(1),
});

export type AIResultType = z.infer<typeof AIResult>;
