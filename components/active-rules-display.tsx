"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ActiveRulesDisplay() {
  const { settings } = useGenshinData()

  // Count how many rules are enabled
  const activeRulesCount = [settings.rules.coopMode, settings.rules.limitFiveStars].filter(Boolean).length

  if (activeRulesCount === 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>No active rules</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Rules are reset when the page is refreshed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">Active rules:</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Rules are reset when the page is refreshed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {settings.rules.coopMode && <Badge variant="outline">Co-op Mode: Enabled</Badge>}
        {settings.rules.limitFiveStars && <Badge variant="outline">5★ Limit: Max {settings.rules.maxFiveStars}</Badge>}
      </div>
    </div>
  )
}
