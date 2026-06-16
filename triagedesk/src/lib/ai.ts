import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { AIResult, AIResultType } from "./validation";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function triageMessage(body: string): Promise<AIResultType> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" }, // forces valid JSON
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(body) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  // Guard: validate the model's output before trusting it
  const parsed = AIResult.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error("AI returned unexpected format");
  }
  return parsed.data;
}
