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

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/triage", { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setMessages(data))
            .catch(() => {
                // Ignore aborted fetch during unmount.
            });

        return () => controller.abort();
    }, []);

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

    const pendingCount = messages.filter((m) => m.status === "pending_review").length;
    const approvedCount = messages.filter((m) => m.status === "approved").length;
    const rejectedCount = messages.filter((m) => m.status === "rejected").length;

    return (
        <div className="min-h-screen">
            <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">TriageDesk</h1>
                        <p className="text-sm text-slate-600">AI support triage with human-in-the-loop review</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-600">
                        Next.js + OpenAI + Zod
                    </div>
                </div>
            </header>

            <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[360px,1fr]">
                <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-lg font-semibold text-slate-900">Submit a ticket</h2>
                    <p className="mb-4 text-sm text-slate-600">Create a new support message for AI triage.</p>

                    <form onSubmit={submit} className="space-y-3">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                            Sender
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            placeholder="jane@acme.com"
                            value={sender}
                            onChange={(e) => setSender(e.target.value)}
                        />

                        <label className="block pt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                            Message
                        </label>
                        <textarea
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            rows={5}
                            placeholder="Describe the customer issue..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />

                        <button
                            disabled={loading}
                            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Triaging..." : "Submit ticket"}
                        </button>
                    </form>
                </section>

                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold text-slate-900">Tickets ({messages.length})</h2>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700">
                                {pendingCount} pending
                            </span>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                                {approvedCount} approved
                            </span>
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-medium text-rose-700">
                                {rejectedCount} rejected
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-10 text-center text-sm text-slate-500">
                                No tickets yet. Submit one from the panel.
                            </p>
                        )}
                        {messages.map((m) => (
                            <MessageCard key={m.id} message={m} onChange={load} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );

}
