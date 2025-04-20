"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"
import { Star } from "lucide-react"

export default function SettingsForm({ type }: { type: "characters" | "bosses" }) {
  const { characters, bosses, settings, updateCharacterEnabled, updateBossEnabled, disableLegendBosses } =
    useGenshinData()
  const [filter, setFilter] = useState("")

  const items = type === "characters" ? characters : bosses
  const updateEnabled = type === "characters" ? updateCharacterEnabled : updateBossEnabled
  const enabledMap = type === "characters" ? settings.characters.enabled : settings.bosses.enabled

  // Group characters by element or bosses by location
  const groupedItems = items.reduce(
    (acc, item) => {
      const groupKey = type === "characters" ? (item as any).element : (item as any).location
      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(item)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // Sort groups alphabetically
  const sortedGroups = Object.keys(groupedItems).sort()

  // Filter items based on search
  const filteredGroups = filter
    ? sortedGroups.reduce(
        (acc, group) => {
          const filteredItems = groupedItems[group].filter((item) =>
            item.name.toLowerCase().includes(filter.toLowerCase()),
          )
          if (filteredItems.length > 0) {
            acc[group] = filteredItems
          }
          return acc
        },
        {} as Record<string, any[]>,
      )
    : groupedItems

  const filteredGroupKeys = Object.keys(filteredGroups).sort()

  // Toggle all items in a group
  const toggleGroup = (group: string, enabled: boolean) => {
    groupedItems[group].forEach((item) => {
      // Skip non-co-op bosses when co-op mode is enabled
      if (type === "bosses" && settings.rules.coopMode && !(item as any).coop) {
        return
      }
      updateEnabled(item.name, enabled)
    })
  }

  // Check if all items in a group are enabled/disabled
  const isGroupEnabled = (group: string) => {
    return groupedItems[group].every((item) => enabledMap[item.name])
  }

  const isGroupPartiallyEnabled = (group: string) => {
    const enabledCount = groupedItems[group].filter((item) => enabledMap[item.name]).length
    return enabledCount > 0 && enabledCount < groupedItems[group].length
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${type}-filter`}>Filter {type}</Label>
          <div className="space-x-2">
            {type === "bosses" && (
              <Button variant="outline" size="sm" onClick={disableLegendBosses}>
                Disable Legends
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                items.forEach((item) => {
                  // Skip non-co-op bosses when co-op mode is enabled
                  if (type === "bosses" && settings.rules.coopMode && !(item as any).coop) {
                    return
                  }
                  updateEnabled(item.name, true)
                })
              }}
            >
              Enable All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                items.forEach((item) => updateEnabled(item.name, false))
              }}
            >
              Disable All
            </Button>
          </div>
        </div>
        <Input
          id={`${type}-filter`}
          placeholder={`Search ${type}...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {type === "bosses" && settings.rules.coopMode && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Co-op Mode is enabled:</strong> Non-co-op bosses are automatically disabled.
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {filteredGroupKeys.map((group) => (
            <div key={group} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Switch
                    checked={isGroupEnabled(group)}
                    onCheckedChange={(checked) => toggleGroup(group, checked)}
                    className={isGroupPartiallyEnabled(group) ? "bg-amber-500" : ""}
                  />
                  {group}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-muted">
                {filteredGroups[group].map((item) => {
                  // Check if this is a non-co-op boss and co-op mode is enabled
                  const isDisabled = type === "bosses" && settings.rules.coopMode && !(item as any).coop
                  const isLegend = type === "bosses" && item.name.startsWith("⭐")

                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between space-x-2 p-2 rounded-md ${
                        isDisabled ? "opacity-50" : "hover:bg-muted"
                      } ${isLegend ? "bg-amber-50 dark:bg-amber-950/20" : ""}`}
                    >
                      <Label htmlFor={`${type}-${item.name}`} className="flex cursor-pointer items-center gap-2">
                        <Image
                          src={
                            type === "bosses"
                              ? `/bosses/${item.location}/${item.icon}?height=32&width=32`
                              : `/characters/${item.element}/${item.icon}?height=32&width=32`
                          }
                          alt={item.name}
                          width={32}
                          height={32}
                          className="object-cover rounded-full"
                        />
                        <span className="flex-1">
                          {item.name}
                          {isDisabled && <span className="text-xs text-muted-foreground ml-1">(Co-op N/A)</span>}
                        </span>
                      </Label>
                      <Switch
                        id={`${type}-${item.name}`}
                        checked={enabledMap[item.name] || false}
                        onCheckedChange={(checked) => updateEnabled(item.name, checked)}
                        disabled={isDisabled}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
