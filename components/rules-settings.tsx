"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RulesSettings() {
  const { settings, toggleCoopMode } = useGenshinData()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Co-op Mode</CardTitle>
          <CardDescription>
            Controls whether multiple Travelers with different elements can be selected in the same roll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch id="coop-mode" checked={settings.rules.coopMode} onCheckedChange={toggleCoopMode} />
            <Label htmlFor="coop-mode">
              {settings.rules.coopMode
                ? "Enabled: Multiple Travelers with different elements can be selected"
                : "Disabled: Only one Traveler can be selected per roll"}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
