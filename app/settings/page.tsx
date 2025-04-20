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

export default function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const defaultTab = searchParams.tab || "characters"
  const { resetSettings, isLoading } = useGenshinData()
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)

  const handleReset = () => {
    resetSettings()
    setShowResetConfirmation(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading settings...</p>
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
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowResetConfirmation(true)} className="mr-2">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <ThemeToggle />
            <Link href="https://github.com/MoonieGZ/Genshin-Randomizer" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub Repository</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Randomizer Settings</CardTitle>
            <CardDescription>Customize which characters and bosses can be selected in the randomizer</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="characters">Characters</TabsTrigger>
                <TabsTrigger value="bosses">Bosses</TabsTrigger>
                <TabsTrigger value="excluded">Excluded</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
