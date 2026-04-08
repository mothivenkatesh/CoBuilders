export const APP_NAME = "AI Cofounder";
export const APP_DESCRIPTION = "Validate your startup idea with an AI that thinks like a YC partner";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/",
  CHAT: "/chat",
  STARTUPS: "/startups",
  SETTINGS: "/settings",
} as const;

export const MAX_MEMORY_TOKENS = 2000;
export const MAX_MESSAGE_LENGTH = 5000;
export const RESEARCH_CACHE_TTL_DAYS = 7;
