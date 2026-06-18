"use client";
import { useState } from "react";
import { Message } from "../types";

interface Props {
  message: Message;
  onChange: () => void; // called after approve/reject so the page refreshes
}

export function MessageCard({ message, onChange }: Props) {
  // Local state for the editable draft reply
  const [editedDraft, setEditedDraft] = useState(message.draftReply ?? "");
  const [loading, setLoading] = useState(false);

  // This function sends the approve or reject action to the server
  const updateStatus = async (newStatus: "approved" | "rejected") => {
    setLoading(true);
    await fetch("/api/triage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: message.id,
        status: newStatus,
        draftReply: editedDraft, // send the (possibly edited) draft
      }),
    });
    setLoading(false);
    onChange(); // tell the parent page to reload the list
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header row: sender + badges */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900">{message.sender}</span>
        <div className="flex gap-2">
          <StatusBadge label={message.status} color={statusColor(message.status)} />
          {message.urgency && (
            <StatusBadge label={message.urgency} color={urgencyColor(message.urgency)} />
          )}
        </div>
      </div>

      {/* Flagged warning */}
      {message.flagged && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">
          ⚠️ Flagged for human review — AI confidence was low or potential injection detected.
        </div>
      )}

      {/* Original message */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Original message</p>
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{message.body}</p>
      </div>

      {/* AI classification */}
      {message.category && (
        <div className="flex gap-4 text-sm text-slate-500">
          <span>📂 {message.category}</span>
          <span>🎭 {message.sentiment}</span>
        </div>
      )}

      {/* Draft reply — editable if still pending */}
      {message.draftReply && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-slate-500">AI draft reply</p>
          {message.status === "pending_review" ? (
            <textarea
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              rows={3}
              value={editedDraft}
              onChange={(e) => setEditedDraft(e.target.value)}
            />
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{message.draftReply}</p>
          )}
        </div>
      )}

      {/* Action buttons — only show if still pending review */}
      {message.status === "pending_review" && (
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => updateStatus("approved")}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            ✅ Approve & Send
          </button>
          <button
            disabled={loading}
            onClick={() => updateStatus("rejected")}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm text-white transition hover:bg-rose-600 disabled:opacity-50"
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// Helper functions to pick badge colours
function statusColor(status: string): string {
  switch (status) {
    case "pending_review": return "border-amber-200 bg-amber-50 text-amber-700";
    case "approved":       return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":       return "border-rose-200 bg-rose-50 text-rose-700";
    case "sent":           return "border-sky-200 bg-sky-50 text-sky-700";
    default:               return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "High":   return "border-rose-200 bg-rose-50 text-rose-700";
    case "Medium": return "border-orange-200 bg-orange-50 text-orange-700";
    case "Low":    return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:       return "border-slate-200 bg-slate-100 text-slate-700";
  }
}
