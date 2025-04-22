import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { GenshinDataProvider } from "@/components/genshin-data-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Moons' Gacha Randomizer",
  description: "Randomize characters and bosses.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <GenshinDataProvider>
              <Suspense>
                {children}
                <Toaster />
              </Suspense>
            </GenshinDataProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'
