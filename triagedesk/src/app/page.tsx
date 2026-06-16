"use client";
import { useEffect, useState } from "react";
import { Message } from "../types";
import { MessageCard } from "../components/MessageCard";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sender, setSender] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/triage");
    setMessages(await res.json());
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, body }),
    });
    setSender(""); setBody("");
    await load();
    setLoading(false);
  };

    return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-black text-white px-6 py-4">
        <h1 className="text-xl font-bold">🛡️ TriageDesk</h1>
        <p className="text-sm text-gray-400">AI support triage with human-in-the-loop review</p>
        </header>

        <main className="mx-auto max-w-3xl p-6">
        {/* Submit form */}
        <div className="bg-white border rounded-xl p-5 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Submit a ticket</h2>
            <form onSubmit={submit} className="space-y-3">
            <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Sender (e.g. jane@acme.com)"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
            />
            <textarea
                className="w-full border rounded-lg p-2 text-sm"
                rows={3}
                placeholder="Incoming support message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />
            <button
                disabled={loading}
                className="bg-black text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? "Triaging..." : "Submit ticket"}
            </button>
            </form>
        </div>

        {/* Ticket count */}
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tickets ({messages.length})</h2>
            <div className="flex gap-2 text-xs text-gray-500">
            <span>🟡 {messages.filter(m => m.status === "pending_review").length} pending</span>
            <span>🟢 {messages.filter(m => m.status === "approved").length} approved</span>
            <span>🔴 {messages.filter(m => m.status === "rejected").length} rejected</span>
            </div>
        </div>

        {/* Message list */}
        <div className="space-y-4">
            {messages.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tickets yet. Submit one above.</p>
            )}
            {messages.map((m) => (
            <MessageCard key={m.id} message={m} onChange={load} />
            ))}
        </div>
        </main>
    </div>
    );

}
