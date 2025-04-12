import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { GenshinDataProvider } from "@/components/genshin-data-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Genshin Impact Randomizer",
  description: "Randomize Genshin Impact characters and bosses"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GenshinDataProvider>
            {children}
            <Toaster />
          </GenshinDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'
