"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Translations = Record<string, any>

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Local Storage key
const LANGUAGE_STORAGE_KEY = "genshin-randomizer-language"

// Available languages
export const AVAILABLE_LANGUAGES = ["en", "fr"]

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("en")
  const [translations, setTranslations] = useState<Translations>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load language from Local Storage
  useEffect(() => {
    const loadLanguage = async () => {
      setIsLoading(true)
      try {
        // Get language from Local Storage or use default
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en"

        // Validate that the language is supported
        const lang = AVAILABLE_LANGUAGES.includes(savedLanguage) ? savedLanguage : "en"

        // Load translations
        const response = await fetch(`/translations/${lang}.json`)
        const data = await response.json()

        setTranslations(data)
        setLanguageState(lang)
      } catch (error) {
        console.error("Error loading language:", error)
        // Fallback to empty translations
        setTranslations({})
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguage()
  }, [])

  // Set language and save to Local Storage
  const setLanguage = async (lang: string) => {
    if (lang === language || !AVAILABLE_LANGUAGES.includes(lang)) return

    setIsLoading(true)
    try {
      // Load new translations
      const response = await fetch(`/translations/${lang}.json`)
      const data = await response.json()

      // Update state and Local Storage
      setTranslations(data)
      setLanguageState(lang)
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch (error) {
      console.error(`Error loading language ${lang}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  // Translation function
  const t = (key: string): string => {
    if (isLoading) return key

    // Split the key by dots and traverse the translations object
    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Key not found, return the key itself
        return key
      }
    }

    return typeof value === "string" ? value : key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
