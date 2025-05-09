"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Github, RotateCcw } from "lucide-react"
import SettingsForm from "@/components/settings-form"
import ExcludedCharacters from "@/components/excluded-characters"
import RulesSettings from "@/components/rules-settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { VersionFooter } from "@/components/version-footer"
import { useGenshinData } from "@/components/genshin-data-provider"
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
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"

export default function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const defaultTab = searchParams.tab || "characters"
  const { resetSettings, isLoading } = useGenshinData()
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)
  const { t, isLoading: isLoadingLanguage } = useLanguage()

  const handleReset = () => {
    resetSettings()
    setShowResetConfirmation(false)
  }

  if (isLoading || isLoadingLanguage) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">{t("app.loading")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">{t("header.back")}</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t("header.settings")}</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirmation(true)}
              className="mr-2 button-enhanced"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("header.reset")}
            </Button>
            <LanguageSelector />
            <ThemeToggle />
            <Link href="https://github.com/MoonieGZ/Genshin-Randomizer" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">{t("header.github")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 main-container">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{t("settings.title")}</CardTitle>
            <CardDescription>{t("settings.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="characters">{t("settings.tabs.characters")}</TabsTrigger>
                <TabsTrigger value="bosses">{t("settings.tabs.bosses")}</TabsTrigger>
                <TabsTrigger value="excluded">{t("settings.tabs.excluded")}</TabsTrigger>
                <TabsTrigger value="rules">{t("settings.tabs.rules")}</TabsTrigger>
              </TabsList>
              <TabsContent value="characters" className="mt-4">
                <SettingsForm type="characters" />
              </TabsContent>
              <TabsContent value="bosses" className="mt-4">
                <SettingsForm type="bosses" />
              </TabsContent>
              <TabsContent value="excluded" className="mt-4">
                <ExcludedCharacters />
              </TabsContent>
              <TabsContent value="rules" className="mt-4">
                <RulesSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4">
          <VersionFooter />
        </div>
      </footer>

      <AlertDialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
        <AlertDialogContent className="dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.resetConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.resetConfirm.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.resetConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="button-enhanced">
              {t("settings.resetConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
