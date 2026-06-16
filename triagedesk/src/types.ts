export type Status = "new" | "pending_review" | "approved" | "rejected" | "sent";

export interface Message {
  id: string;
  sender: string;
  body: string;            // raw, untrusted user input
  category?: string;       // AI output
  urgency?: "Low" | "Medium" | "High";
  sentiment?: "Positive" | "Neutral" | "Negative";
  draftReply?: string;     // AI output
  flagged: boolean;        // injection / low-confidence escalation
  status: Status;
  createdAt: string;
}
