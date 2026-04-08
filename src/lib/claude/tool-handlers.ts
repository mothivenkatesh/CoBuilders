import { createAdminClient } from "@/lib/supabase/admin";

type ToolContext = {
  userId: string;
  startupId: string;
  conversationId: string;
};

export async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  switch (toolName) {
    case "web_search":
      return handleWebSearch(toolInput as { query: string; purpose: string });
    case "fetch_webpage":
      return handleFetchWebpage(toolInput as { url: string; extract: string });
    case "research_market":
      return handleResearchMarket(
        toolInput as { query: string; research_type: string },
        context
      );
    case "lookup_competitor":
      return handleLookupCompetitor(
        toolInput as { company_name: string; website_url?: string; aspects: string[] },
        context
      );
    case "save_memory":
      return handleSaveMemory(toolInput, context);
    case "update_score":
      return handleUpdateScore(toolInput, context);
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

async function handleWebSearch(input: { query: string; purpose: string }): Promise<string> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return JSON.stringify({
      results: [],
      note: "Web search not configured. Set BRAVE_SEARCH_API_KEY.",
    });
  }

  try {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", input.query);
    url.searchParams.set("count", "5");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!res.ok) {
      return JSON.stringify({ error: `Search failed: ${res.status}` });
    }

    const data = await res.json();
    const results = (data.web?.results || []).slice(0, 5).map(
      (r: { title: string; url: string; description: string }) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
      })
    );

    return JSON.stringify({ query: input.query, purpose: input.purpose, results });
  } catch (err) {
    return JSON.stringify({ error: `Search error: ${String(err)}` });
  }
}

async function handleFetchWebpage(input: { url: string; extract: string }): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  // Fallback to Jina Reader if no Firecrawl key
  if (!apiKey) {
    try {
      const jinaUrl = `https://r.jina.ai/${input.url}`;
      const res = await fetch(jinaUrl, {
        headers: { Accept: "text/plain" },
      });
      const text = await res.text();
      return JSON.stringify({
        url: input.url,
        extract: input.extract,
        content: text.slice(0, 3000),
      });
    } catch (err) {
      return JSON.stringify({ error: `Fetch error: ${String(err)}` });
    }
  }

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: input.url,
        formats: ["markdown"],
      }),
    });

    const data = await res.json();
    const content = data.data?.markdown || data.data?.content || "";

    return JSON.stringify({
      url: input.url,
      extract: input.extract,
      content: content.slice(0, 3000),
    });
  } catch (err) {
    return JSON.stringify({ error: `Fetch error: ${String(err)}` });
  }
}

async function handleResearchMarket(
  input: { query: string; research_type: string },
  context: ToolContext
): Promise<string> {
  const supabase = createAdminClient();

  // Check cache first
  const { data: cached } = await supabase
    .from("market_research_cache")
    .select("*")
    .eq("startup_id", context.startupId)
    .eq("research_type", input.research_type)
    .ilike("query", `%${input.query.split(" ").slice(0, 3).join("%")}%`)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .single();

  if (cached) {
    return JSON.stringify({
      source: "cache",
      query: cached.query,
      summary: cached.content_summary,
      data: cached.raw_data,
    });
  }

  // Search the web
  const searchResult = await handleWebSearch({
    query: input.query,
    purpose: `Market research: ${input.research_type}`,
  });
  const searchData = JSON.parse(searchResult);

  // Cache the results
  if (searchData.results?.length > 0) {
    await supabase.from("market_research_cache").insert({
      startup_id: context.startupId,
      query: input.query,
      source_url: searchData.results[0]?.url,
      content_summary: searchData.results
        .map((r: { title: string; snippet: string }) => `${r.title}: ${r.snippet}`)
        .join("\n"),
      raw_data: searchData,
      research_type: input.research_type,
    });
  }

  return JSON.stringify({
    source: "fresh",
    query: input.query,
    research_type: input.research_type,
    results: searchData.results,
  });
}

async function handleLookupCompetitor(
  input: { company_name: string; website_url?: string; aspects: string[] },
  context: ToolContext
): Promise<string> {
  // Search for competitor info
  const searchResult = await handleWebSearch({
    query: `${input.company_name} ${input.aspects.join(" ")} company`,
    purpose: `Competitor research: ${input.company_name}`,
  });
  const searchData = JSON.parse(searchResult);

  // Save to competitor_intel table
  const supabase = createAdminClient();
  await supabase.from("competitor_intel").upsert(
    {
      startup_id: context.startupId,
      competitor_name: input.company_name,
      website_url: input.website_url || searchData.results?.[0]?.url,
      description: searchData.results?.[0]?.snippet,
      source: "web_search",
    },
    { onConflict: "startup_id,competitor_name", ignoreDuplicates: false }
  );

  return JSON.stringify({
    competitor: input.company_name,
    aspects_researched: input.aspects,
    results: searchData.results,
    saved: true,
  });
}

async function handleSaveMemory(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const supabase = createAdminClient();

  // If superseding, mark old memory
  if (input.supersedes_memory_id) {
    await supabase
      .from("memories")
      .update({ is_superseded: true, superseded_by: null })
      .eq("id", input.supersedes_memory_id);
  }

  const { data, error } = await supabase
    .from("memories")
    .insert({
      user_id: context.userId,
      startup_id: context.startupId,
      conversation_id: context.conversationId,
      memory_type: input.memory_type as string,
      content: input.content as string,
      layer: (input.layer as string) || null,
      confidence: (input.confidence as number) || null,
    })
    .select("id")
    .single();

  if (error) {
    return JSON.stringify({ error: error.message });
  }

  // Update superseded_by reference
  if (input.supersedes_memory_id && data) {
    await supabase
      .from("memories")
      .update({ superseded_by: data.id })
      .eq("id", input.supersedes_memory_id);
  }

  return JSON.stringify({ saved: true, memory_id: data?.id });
}

async function handleUpdateScore(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("validation_scores").upsert(
    {
      startup_id: context.startupId,
      conversation_id: context.conversationId,
      layer: input.layer as string,
      score: input.score as number,
      rationale: (input.rationale as string) || null,
      key_gaps: (input.key_gaps as string[]) || [],
      key_strengths: (input.key_strengths as string[]) || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "startup_id,layer" }
  );

  if (error) {
    return JSON.stringify({ error: error.message });
  }

  return JSON.stringify({
    updated: true,
    layer: input.layer,
    score: input.score,
  });
}
