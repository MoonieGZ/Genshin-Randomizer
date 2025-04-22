"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

// Define the Character and Boss types
export type Character = {
  name: string
  rarity: number
  element: string
  icon: string
}

export type Boss = {
  name: string
  icon: string
  location: string
  link: string
  coop: boolean
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
    limitFiveStars: boolean
    maxFiveStars: number
  }
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
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
    limitFiveStars: false,
    maxFiveStars: 2,
  },
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
  toggleLimitFiveStars: (enabled: boolean) => void
  updateMaxFiveStars: (count: number) => void
  getNonCoopBosses: () => Boss[]
  disableLegendBosses: () => void
  resetSettings: () => void
  isLoading: boolean
  bossLocations: string[] // Add this to track location order
}

const GenshinDataContext = createContext<GenshinDataContextType | undefined>(undefined)

// Local Storage key
const STORAGE_KEY = "genshin-randomizer-settings"

// Update the initial state in the GenshinDataProvider
export function GenshinDataProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [bosses, setBosses] = useState<Boss[]>([])
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS })
  const [isLoading, setIsLoading] = useState(true)
  const [bossLocations, setBossLocations] = useState<string[]>([]) // Add this to track location order

  // Save settings to Local Storage
  const saveSettings = (newSettings: Settings) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    }
  }

  // Load settings from Local Storage
  const loadSettings = (): Settings | null => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings)
        } catch (error) {
          console.error("Error parsing saved settings:", error)
        }
      }
    }
    return null
  }

  // Initialize character and boss data
  const initializeData = (characters: Character[], bosses: Boss[], savedSettings: Settings | null) => {
    // Initialize character enabled states
    const enabledCharacters: Record<string, boolean> = {}
    characters.forEach((character) => {
      enabledCharacters[character.name] = savedSettings?.characters.enabled[character.name] ?? true
    })

    // Initialize boss enabled states
    const enabledBosses: Record<string, boolean> = {}
    bosses.forEach((boss) => {
      // If we have saved settings, use those
      if (savedSettings?.bosses.enabled[boss.name] !== undefined) {
        enabledBosses[boss.name] = savedSettings.bosses.enabled[boss.name]
      } else {
        // Otherwise, disable legends by default
        enabledBosses[boss.name] = !boss.name.startsWith("⭐")
      }
    })

    // Create new settings object
    const newSettings: Settings = {
      characters: {
        count: savedSettings?.characters.count ?? DEFAULT_SETTINGS.characters.count,
        enabled: enabledCharacters,
        excluded: savedSettings?.characters.excluded ?? [],
      },
      bosses: {
        count: savedSettings?.bosses.count ?? DEFAULT_SETTINGS.bosses.count,
        enabled: enabledBosses,
      },
      enableExclusion: savedSettings?.enableExclusion ?? DEFAULT_SETTINGS.enableExclusion,
      rules: {
        coopMode: savedSettings?.rules.coopMode ?? DEFAULT_SETTINGS.rules.coopMode,
        limitFiveStars: savedSettings?.rules.limitFiveStars ?? DEFAULT_SETTINGS.rules.limitFiveStars,
        maxFiveStars: savedSettings?.rules.maxFiveStars ?? DEFAULT_SETTINGS.rules.maxFiveStars,
      },
    }

    // If co-op mode is enabled, disable all non-co-op bosses
    if (newSettings.rules.coopMode) {
      bosses.forEach((boss) => {
        if (!boss.coop) {
          newSettings.bosses.enabled[boss.name] = false
        }
      })
    }

    setSettings(newSettings)
    saveSettings(newSettings)
    setIsLoading(false)
  }

  useEffect(() => {
    // Load data and settings
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load saved settings
        const savedSettings = loadSettings()

        // Load characters data
        const charactersResponse = await fetch("/data/characters.json")
        const charactersData: Character[] = await charactersResponse.json()
        setCharacters(charactersData)

        // Load bosses data
        const bossesResponse = await fetch("/data/bosses.json")
        const bossesData: Boss[] = await bossesResponse.json()
        setBosses(bossesData)

        // Extract unique locations in the order they appear in the JSON
        const locations: string[] = []
        bossesData.forEach((boss) => {
          if (!locations.includes(boss.location)) {
            locations.push(boss.location)
          }
        })
        setBossLocations(locations)

        // Initialize settings
        initializeData(charactersData, bossesData, savedSettings)
      } catch (error) {
        console.error("Error loading data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Save settings whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveSettings(settings)
    }
  }, [settings, isLoading])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
      }
      return updated
    })
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

  const getNonCoopBosses = () => {
    return bosses.filter((boss) => !boss.coop && settings.bosses.enabled[boss.name])
  }

  const toggleCoopMode = (enabled: boolean) => {
    // If enabling co-op mode, disable all non-co-op bosses
    if (enabled) {
      const updatedEnabledBosses = { ...settings.bosses.enabled }

      bosses.forEach((boss) => {
        if (!boss.coop) {
          updatedEnabledBosses[boss.name] = false
        }
      })

      setSettings((prev) => ({
        ...prev,
        rules: {
          ...prev.rules,
          coopMode: enabled,
        },
        bosses: {
          ...prev.bosses,
          enabled: updatedEnabledBosses,
        },
      }))
    } else {
      // Just toggle the co-op mode without affecting bosses
      setSettings((prev) => ({
        ...prev,
        rules: {
          ...prev.rules,
          coopMode: enabled,
        },
      }))
    }
  }

  const toggleLimitFiveStars = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        limitFiveStars: enabled,
      },
    }))
  }

  const updateMaxFiveStars = (count: number) => {
    setSettings((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        maxFiveStars: count,
      },
    }))
  }

  const disableLegendBosses = () => {
    const updatedEnabledBosses = { ...settings.bosses.enabled }

    bosses.forEach((boss) => {
      if (boss.name.startsWith("⭐")) {
        updatedEnabledBosses[boss.name] = false
      }
    })

    setSettings((prev) => ({
      ...prev,
      bosses: {
        ...prev.bosses,
        enabled: updatedEnabledBosses,
      },
    }))
  }

  const resetSettings = () => {
    // Re-initialize with default settings
    initializeData(characters, bosses, null)
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
        toggleLimitFiveStars,
        updateMaxFiveStars,
        getNonCoopBosses,
        disableLegendBosses,
        resetSettings,
        isLoading,
        bossLocations, // Add this to the context
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
