import { NextResponse } from "next/server";
import { TriageInput } from "../../../lib/validation";
import { triageMessage } from "../../../lib/ai";
import { checkRateLimit } from "../../../lib/rateLimit";
import { store } from "../../../lib/store";
import { Message } from "../../../types";

const CONFIDENCE_THRESHOLD = 0.6;

export async function POST(req: Request) {
  // Guard: rate limit (keyed by IP in real use; static key fine for demo)
  if (!checkRateLimit("global")) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Guard: validate input
  const json = await req.json().catch(() => null);
  const parsed = TriageInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { sender, body } = parsed.data;

  try {
    const ai = await triageMessage(body);

    // Guard: low confidence => flag for human, never auto-trust
    const flagged = ai.confidence < CONFIDENCE_THRESHOLD;

    const message: Message = {
      id: crypto.randomUUID(),
      sender,
      body,
      category: ai.category,
      urgency: ai.urgency,
      sentiment: ai.sentiment,
      draftReply: ai.draftReply,
      flagged,
      status: "pending_review", // ALWAYS needs human approval — core guard
      createdAt: new Date().toISOString(),
    };

    store.add(message);
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("TRIAGE ERROR:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}


export async function GET() {
  return NextResponse.json(store.all());
}

export async function PATCH(req: Request) {
  const json = await req.json().catch(() => null);

  // We expect: { id: "some-id", status: "approved" or "rejected", draftReply?: "edited text" }
  if (!json || !json.id || !json.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  // Only allow valid status transitions
  const allowedStatuses = ["approved", "rejected", "sent"];
  if (!allowedStatuses.includes(json.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Build the update — always include status, optionally include edited draft
  const patch: Record<string, string> = { status: json.status };
  if (json.draftReply) {
    patch.draftReply = json.draftReply;
  }

  const updated = store.update(json.id, patch);

  if (!updated) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

