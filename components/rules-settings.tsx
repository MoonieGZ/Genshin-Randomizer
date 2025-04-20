"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ActiveRulesDisplay } from "./active-rules-display"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function RulesSettings() {
  const { settings, toggleCoopMode, toggleLimitFiveStars, updateMaxFiveStars, getNonCoopBosses } = useGenshinData()
  const [showCoopConfirmation, setShowCoopConfirmation] = useState(false)
  const nonCoopBosses = getNonCoopBosses()

  const handleCoopToggle = (enabled: boolean) => {
    if (enabled && nonCoopBosses.length > 0) {
      setShowCoopConfirmation(true)
    } else {
      toggleCoopMode(enabled)
    }
  }

  const confirmCoopMode = () => {
    toggleCoopMode(true)
    setShowCoopConfirmation(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg mb-6">
        <ActiveRulesDisplay />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Co-op Mode</CardTitle>
          <CardDescription>
            Controls whether multiple Travelers with different elements can be selected in a single roll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch id="coop-mode" checked={settings.rules.coopMode} onCheckedChange={handleCoopToggle} />
            <Label htmlFor="coop-mode">
              {settings.rules.coopMode
                ? "Enabled: Multiple Travelers with different elements can be selected"
                : "Disabled: Only one Traveler can be selected per roll"}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5-Star Character Limit</CardTitle>
          <CardDescription>
            Controls the maximum number of 5-star characters that can be selected in a single roll
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="limit-five-stars"
              checked={settings.rules.limitFiveStars}
              onCheckedChange={toggleLimitFiveStars}
            />
            <Label htmlFor="limit-five-stars">
              {settings.rules.limitFiveStars
                ? "Enabled: Limit the number of 5-star characters per roll"
                : "Disabled: No limit on 5-star characters"}
            </Label>
          </div>

          {settings.rules.limitFiveStars && (
            <div className="flex items-center space-x-2 pl-8">
              <Label htmlFor="max-five-stars">Maximum 5-star characters:</Label>
              <Input
                id="max-five-stars"
                type="number"
                min="0"
                max="10"
                value={settings.rules.maxFiveStars}
                onChange={(e) => updateMaxFiveStars(Number.parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showCoopConfirmation} onOpenChange={setShowCoopConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Non-Co-op Bosses?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              Enabling Co-op mode will disable the following bosses that don't support co-op play:
              <ul className="list-disc pl-6 max-h-60 overflow-y-auto">
                {nonCoopBosses.map((boss) => (
                  <li key={boss.name}>{boss.name}</li>
                ))}
              </ul>
              These bosses will be automatically disabled in your settings.
              Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCoopMode}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
