import type { ToolCallDisplay } from "@/types/chat";
import { Spinner } from "@/components/ui";

const toolLabels: Record<string, string> = {
  web_search: "Searching the web",
  fetch_webpage: "Reading webpage",
  research_market: "Researching market",
  lookup_competitor: "Analyzing competitor",
  save_memory: "Saving insight",
  update_score: "Updating score",
};

export function ToolCallIndicator({ toolCall }: { toolCall: ToolCallDisplay }) {
  const label = toolLabels[toolCall.name] || toolCall.name;
  const isRunning = toolCall.status === "running";

  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-200/50 px-3 py-1.5 text-xs text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400">
      {isRunning ? (
        <Spinner size="sm" />
      ) : (
        <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
      )}
      <span>{label}</span>
      {toolCall.name === "web_search" && toolCall.input?.query ? (
        <span className="italic text-zinc-400">&quot;{String(toolCall.input.query)}&quot;</span>
      ) : null}
      {toolCall.name === "lookup_competitor" && toolCall.input?.company_name ? (
        <span className="italic text-zinc-400">{String(toolCall.input.company_name)}</span>
      ) : null}
    </div>
  );
}
