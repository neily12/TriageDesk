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
    <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
      {/* Header row: sender + badges */}
      <div className="flex items-center justify-between">
        <span className="font-semibold">{message.sender}</span>
        <div className="flex gap-2">
          <StatusBadge label={message.status} color={statusColor(message.status)} />
          {message.urgency && (
            <StatusBadge label={message.urgency} color={urgencyColor(message.urgency)} />
          )}
        </div>
      </div>

      {/* Flagged warning */}
      {message.flagged && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-2 text-sm">
          ⚠️ Flagged for human review — AI confidence was low or potential injection detected.
        </div>
      )}

      {/* Original message */}
      <div>
        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Original message</p>
        <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{message.body}</p>
      </div>

      {/* AI classification */}
      {message.category && (
        <div className="flex gap-4 text-sm text-gray-500">
          <span>📂 {message.category}</span>
          <span>🎭 {message.sentiment}</span>
        </div>
      )}

      {/* Draft reply — editable if still pending */}
      {message.draftReply && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">AI draft reply</p>
          {message.status === "pending_review" ? (
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              rows={3}
              value={editedDraft}
              onChange={(e) => setEditedDraft(e.target.value)}
            />
          ) : (
            <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{message.draftReply}</p>
          )}
        </div>
      )}

      {/* Action buttons — only show if still pending review */}
      {message.status === "pending_review" && (
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => updateStatus("approved")}
            className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-700 disabled:opacity-50"
          >
            ✅ Approve & Send
          </button>
          <button
            disabled={loading}
            onClick={() => updateStatus("rejected")}
            className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-red-600 disabled:opacity-50"
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// Helper functions to pick badge colours
function statusColor(status: string): string {
  switch (status) {
    case "pending_review": return "bg-yellow-100 text-yellow-800";
    case "approved":       return "bg-green-100 text-green-800";
    case "rejected":       return "bg-red-100 text-red-800";
    case "sent":           return "bg-blue-100 text-blue-800";
    default:               return "bg-gray-100 text-gray-800";
  }
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "High":   return "bg-red-100 text-red-800";
    case "Medium": return "bg-orange-100 text-orange-800";
    case "Low":    return "bg-green-100 text-green-800";
    default:       return "bg-gray-100 text-gray-800";
  }
}
