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
import { useLanguage } from "./language-provider"

export default function RulesSettings() {
  const { settings, toggleCoopMode, toggleLimitFiveStars, updateMaxFiveStars, getNonCoopBosses } = useGenshinData()
  const [showCoopConfirmation, setShowCoopConfirmation] = useState(false)
  const nonCoopBosses = getNonCoopBosses()
  const { t } = useLanguage()

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
          <CardTitle>{t("rules.coopMode.title")}</CardTitle>
          <CardDescription>{t("rules.coopMode.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch id="coop-mode" checked={settings.rules.coopMode} onCheckedChange={handleCoopToggle} />
            <Label htmlFor="coop-mode">
              {settings.rules.coopMode ? t("rules.coopMode.enabled") : t("rules.coopMode.disabled")}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("rules.fiveStarLimit.title")}</CardTitle>
          <CardDescription>{t("rules.fiveStarLimit.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="limit-five-stars"
              checked={settings.rules.limitFiveStars}
              onCheckedChange={toggleLimitFiveStars}
            />
            <Label htmlFor="limit-five-stars">
              {settings.rules.limitFiveStars ? t("rules.fiveStarLimit.enabled") : t("rules.fiveStarLimit.disabled")}
            </Label>
          </div>

          {settings.rules.limitFiveStars && (
            <div className="flex items-center space-x-2 pl-8">
              <Label htmlFor="max-five-stars">{t("rules.fiveStarLimit.maximum")}</Label>
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
            <AlertDialogTitle>{t("rules.coopConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {t("rules.coopConfirm.description")}
              <ul className="list-disc pl-6 max-h-60 overflow-y-auto">
                {nonCoopBosses.map((boss) => (
                  <li key={boss.name}>{boss.name}</li>
                ))}
              </ul>
              {t("rules.coopConfirm.note")}
              <p>{t("rules.coopConfirm.question")}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("rules.coopConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCoopMode}>{t("rules.coopConfirm.confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
