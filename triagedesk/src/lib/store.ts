import { Message } from "../types";

// MVP store. Explain: "swappable for Supabase/Postgres — the API layer doesn't change,
// only this module, because storage is isolated behind one interface."
let messages: Message[] = [];

export const store = {
  all: () => messages,
  add: (m: Message) => { messages = [m, ...messages]; return m; },
  update: (id: string, patch: Partial<Message>) => {
    messages = messages.map((m) => (m.id === id ? { ...m, ...patch } : m));
    return messages.find((m) => m.id === id);
  },
};
