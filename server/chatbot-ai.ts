import Anthropic from "@anthropic-ai/sdk";
import { CHATBOT_SYSTEM_PROMPT } from "./chatbot-knowledge.js";
import { findBestResponse } from "./chatbot-responses.js";

const MAX_HISTORY = 10; // messages per session (5 exchanges)
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface SessionMessage {
  role: "user" | "assistant";
  content: string;
}

interface Session {
  messages: SessionMessage[];
  lastActivity: number;
}

const sessions = new Map<string, Session>();

// Prune sessions older than TTL to avoid unbounded memory growth
function pruneStales() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  sessions.forEach((session, id) => {
    if (session.lastActivity < cutoff) sessions.delete(id);
  });
}

function getOrCreateSession(sessionId: string): Session {
  pruneStales();
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { messages: [], lastActivity: Date.now() });
  }
  const session = sessions.get(sessionId)!;
  session.lastActivity = Date.now();
  return session;
}

function appendToSession(session: Session, role: "user" | "assistant", content: string) {
  session.messages.push({ role, content });
  // Keep last MAX_HISTORY messages
  if (session.messages.length > MAX_HISTORY) {
    session.messages = session.messages.slice(session.messages.length - MAX_HISTORY);
  }
}

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

export async function getChatResponse(
  message: string,
  language: "en" | "fr",
  sessionId: string
): Promise<{ response: string; sessionId: string }> {
  const client = getClient();

  // Fallback to keyword matcher if no API key
  if (!client) {
    return {
      response: findBestResponse(message, language),
      sessionId,
    };
  }

  const session = getOrCreateSession(sessionId);
  appendToSession(session, "user", message);

  try {
    const result = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: CHATBOT_SYSTEM_PROMPT,
      messages: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const responseText =
      result.content[0].type === "text" ? result.content[0].text : "";

    appendToSession(session, "assistant", responseText);

    return { response: responseText, sessionId };
  } catch (err) {
    console.error("Anthropic API error — falling back to keyword matcher:", err);
    const fallback = findBestResponse(message, language);
    appendToSession(session, "assistant", fallback);
    return { response: fallback, sessionId };
  }
}
