import type Anthropic from "@anthropic-ai/sdk";

export const agentTools: Anthropic.Tool[] = [
  {
    name: "web_search",
    description:
      "Search the web for real-time information. Use this to look up market data, competitor info, funding news, regulatory changes, industry trends, or to verify any factual claim a founder makes.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        purpose: {
          type: "string",
          description:
            "Why you're searching — e.g. 'verify TAM claim', 'check competitor funding', 'find market growth rate'",
        },
      },
      required: ["query", "purpose"],
    },
  },
  {
    name: "fetch_webpage",
    description:
      "Fetch and read the content of a specific webpage. Use this to scrape competitor websites, read articles, or get detailed information from a URL found via web_search.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The URL to fetch",
        },
        extract: {
          type: "string",
          description:
            "What specific information to extract — e.g. 'pricing plans', 'product features', 'funding details'",
        },
      },
      required: ["url", "extract"],
    },
  },
  {
    name: "research_market",
    description:
      "Conduct market research by searching the web and reading top results. Returns structured market data. Results are cached for 7 days.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "The market research query",
        },
        research_type: {
          type: "string",
          enum: ["market_size", "trend", "competitor", "regulation", "news", "pricing"],
          description: "The type of research being conducted",
        },
      },
      required: ["query", "research_type"],
    },
  },
  {
    name: "lookup_competitor",
    description:
      "Research a specific competitor. Searches for info and saves structured competitor intelligence to the database.",
    input_schema: {
      type: "object" as const,
      properties: {
        company_name: {
          type: "string",
          description: "Name of the competitor company",
        },
        website_url: {
          type: "string",
          description: "Competitor's website URL (optional)",
        },
        aspects: {
          type: "array",
          items: { type: "string" },
          description:
            "What aspects to research — e.g. ['funding', 'pricing', 'features', 'market_position', 'team_size']",
        },
      },
      required: ["company_name", "aspects"],
    },
  },
  {
    name: "save_memory",
    description:
      "Save a key learning or observation to the agent's memory. Call this when you identify: a founder decision, a pivot, a key insight, research findings, identified gaps, validated strengths, or kill risks. These memories persist across sessions.",
    input_schema: {
      type: "object" as const,
      properties: {
        memory_type: {
          type: "string",
          enum: ["decision", "pivot", "insight", "research", "feedback", "gap", "strength", "risk"],
          description: "The type of memory to save",
        },
        content: {
          type: "string",
          description: "The memory content — be specific and actionable",
        },
        layer: {
          type: "string",
          enum: [
            "problem_pain",
            "customer_market",
            "solution_diff",
            "unit_economics",
            "pnl_viability",
            "market_timing",
            "founder_fit",
            "traction_pmf",
          ],
          description: "Which validation layer this memory relates to (optional)",
        },
        confidence: {
          type: "number",
          description: "Confidence level 0-1 (optional)",
        },
        supersedes_memory_id: {
          type: "string",
          description: "ID of a previous memory this supersedes (e.g. when a decision changes)",
        },
      },
      required: ["memory_type", "content"],
    },
  },
  {
    name: "update_score",
    description:
      "Update the validation score for a layer. Call this after a meaningful discussion of a validation layer — not after every message. Scores are 1-5.",
    input_schema: {
      type: "object" as const,
      properties: {
        layer: {
          type: "string",
          enum: [
            "problem_pain",
            "customer_market",
            "solution_diff",
            "unit_economics",
            "pnl_viability",
            "market_timing",
            "founder_fit",
            "traction_pmf",
          ],
          description: "Which validation layer to score",
        },
        score: {
          type: "number",
          description: "Score 1-5. 1=fatal flaw, 2=weak, 3=needs work, 4=solid, 5=exceptional",
        },
        rationale: {
          type: "string",
          description: "Brief explanation for this score",
        },
        key_gaps: {
          type: "array",
          items: { type: "string" },
          description: "Key gaps or weaknesses identified",
        },
        key_strengths: {
          type: "array",
          items: { type: "string" },
          description: "Key strengths identified",
        },
      },
      required: ["layer", "score", "rationale"],
    },
  },
];
