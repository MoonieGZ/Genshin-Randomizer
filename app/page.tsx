"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Settings, Github } from "lucide-react"
import RandomizerForm from "@/components/randomizer-form"
import AcceptedCharacters from "@/components/accepted-characters"
import { ThemeToggle } from "@/components/theme-toggle"
import { VersionFooter } from "@/components/version-footer"
import { ActiveRulesDisplay } from "@/components/active-rules-display"
import { PoolInfo } from "@/components/pool-info"
import { useGenshinData } from "@/components/genshin-data-provider"

export default function Home() {
  const { isLoading } = useGenshinData()

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Genshin Impact Randomizer</h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Link href="https://github.com/MoonieGZ/Genshin-Randomizer" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub Repository</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-2">
            <PoolInfo />
            <RandomizerForm />
            <ActiveRulesDisplay />
          </CardContent>
        </Card>

        <AcceptedCharacters />
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4">
          <VersionFooter />
        </div>
      </footer>
    </div>
  )
}
