import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}

export const CHAT_MODEL = "claude-sonnet-4-20250514";
export const EXTRACTION_MODEL = "claude-opus-4-20250514";
