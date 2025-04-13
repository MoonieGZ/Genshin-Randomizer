"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

// Define the Character and Boss types
export type Character = {
  name: string
  element: string
}

export type Boss = {
  name: string
  region: string
  link: string
}

// Update the Settings type to include excluded characters and the exclusion toggle
export type Settings = {
  characters: {
    count: number
    enabled: Record<string, boolean>
    excluded: string[]
  }
  bosses: {
    count: number
    enabled: Record<string, boolean>
  }
  enableExclusion: boolean
  rules: {
    coopMode: boolean
  }
}

// Update the GenshinDataContextType to include new functions
type GenshinDataContextType = {
  characters: Character[]
  bosses: Boss[]
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  updateCharacterEnabled: (name: string, enabled: boolean) => void
  updateBossEnabled: (name: string, enabled: boolean) => void
  updateCharacterCount: (count: number) => void
  updateBossCount: (count: number) => void
  excludeCharacter: (name: string) => void
  includeCharacter: (name: string) => void
  toggleExclusion: (enabled: boolean) => void
  toggleCoopMode: (enabled: boolean) => void
}

const GenshinDataContext = createContext<GenshinDataContextType | undefined>(undefined)

// Update the initial state in the GenshinDataProvider
export function GenshinDataProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [bosses, setBosses] = useState<Boss[]>([])
  const [settings, setSettings] = useState<Settings>({
    characters: {
      count: 4,
      enabled: {},
      excluded: [],
    },
    bosses: {
      count: 8,
      enabled: {},
    },
    enableExclusion: true,
    rules: {
      coopMode: false,
    },
  })

  useEffect(() => {
    // Load characters data
    fetch("/data/characters.json")
      .then((res) => res.json())
      .then((data: Character[]) => {
        setCharacters(data)
        // Initialize all characters as enabled
        const enabledCharacters: Record<string, boolean> = {}
        data.forEach((character) => {
          enabledCharacters[character.name] = true
        })
        setSettings((prev) => ({
          ...prev,
          characters: {
            ...prev.characters,
            enabled: enabledCharacters,
          },
        }))
      })
      .catch((error) => console.error("Error loading characters:", error))

    // Load bosses data
    fetch("/data/bosses.json")
      .then((res) => res.json())
      .then((data: Boss[]) => {
        setBosses(data)
        // Initialize all bosses as enabled
        const enabledBosses: Record<string, boolean> = {}
        data.forEach((boss) => {
          enabledBosses[boss.name] = true
        })
        setSettings((prev) => ({
          ...prev,
          bosses: {
            ...prev.bosses,
            enabled: enabledBosses,
          },
        }))
      })
      .catch((error) => console.error("Error loading bosses:", error))
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }

  const updateCharacterEnabled = (name: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        enabled: {
          ...prev.characters.enabled,
          [name]: enabled,
        },
      },
    }))
  }

  const updateBossEnabled = (name: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      bosses: {
        ...prev.bosses,
        enabled: {
          ...prev.bosses.enabled,
          [name]: enabled,
        },
      },
    }))
  }

  const updateCharacterCount = (count: number) => {
    setSettings((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        count,
      },
    }))
  }

  const updateBossCount = (count: number) => {
    setSettings((prev) => ({
      ...prev,
      bosses: {
        ...prev.bosses,
        count,
      },
    }))
  }

  const excludeCharacter = (name: string) => {
    setSettings((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        excluded: [...prev.characters.excluded, name],
      },
    }))
  }

  const includeCharacter = (name: string) => {
    setSettings((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        excluded: prev.characters.excluded.filter((char) => char !== name),
      },
    }))
  }

  const toggleExclusion = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enableExclusion: enabled,
    }))
  }

  const toggleCoopMode = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        coopMode: enabled,
      },
    }))
  }

  return (
    <GenshinDataContext.Provider
      value={{
        characters,
        bosses,
        settings,
        updateSettings,
        updateCharacterEnabled,
        updateBossEnabled,
        updateCharacterCount,
        updateBossCount,
        excludeCharacter,
        includeCharacter,
        toggleExclusion,
        toggleCoopMode,
      }}
    >
      {children}
    </GenshinDataContext.Provider>
  )
}

export function useGenshinData() {
  const context = useContext(GenshinDataContext)
  if (context === undefined) {
    throw new Error("useGenshinData must be used within a GenshinDataProvider")
  }
  return context
}
