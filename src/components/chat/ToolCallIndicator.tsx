import type { ToolCallDisplay } from "@/types/chat";
import { Badge } from "@tremor/react";
import { Spinner } from "@/components/ui/spinner";
import { RiCheckLine, RiSearchLine, RiGlobalLine, RiBarChartBoxLine, RiBrainLine, RiSpeedLine } from "@remixicon/react";

const toolConfig: Record<string, { label: string; icon: typeof RiSearchLine }> = {
  web_search: { label: "Searching the web", icon: RiSearchLine },
  fetch_webpage: { label: "Reading webpage", icon: RiGlobalLine },
  research_market: { label: "Researching market", icon: RiBarChartBoxLine },
  lookup_competitor: { label: "Analyzing competitor", icon: RiBarChartBoxLine },
  save_memory: { label: "Saving insight", icon: RiBrainLine },
  update_score: { label: "Updating score", icon: RiSpeedLine },
};

export function ToolCallIndicator({ toolCall }: { toolCall: ToolCallDisplay }) {
  const config = toolConfig[toolCall.name] || { label: toolCall.name, icon: RiSearchLine };
  const isRunning = toolCall.status === "running";
  const IconComp = isRunning ? null : RiCheckLine;

  return (
    <div className="flex items-center gap-2 rounded-tremor-default bg-tremor-background-subtle/50 px-3 py-1.5">
      {isRunning ? (
        <Spinner size="sm" />
      ) : (
        IconComp && <IconComp className="h-3.5 w-3.5 text-green-500" />
      )}
      <span className="text-xs text-tremor-content">{config.label}</span>
      {toolCall.name === "web_search" && toolCall.input?.query ? (
        <Badge size="xs" color="slate">{String(toolCall.input.query)}</Badge>
      ) : null}
      {toolCall.name === "lookup_competitor" && toolCall.input?.company_name ? (
        <Badge size="xs" color="slate">{String(toolCall.input.company_name)}</Badge>
      ) : null}
    </div>
  );
}
