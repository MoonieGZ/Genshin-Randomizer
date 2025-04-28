"use client"

import { useState, useEffect } from "react"
import { useGenshinData } from "./genshin-data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dice5, Dices } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

type RandomResult = {
  characters: Array<{
    name: string
    rarity: number
    element: string
    icon: string
    selected?: boolean
    visible?: boolean
  }>
  bosses: Array<{
    name: string
    icon: string
    location: string
    link: string
    coop: boolean
    visible?: boolean
  }>
}

export default function RandomizerForm() {
  const { characters, bosses, settings, updateCharacterCount, updateBossCount, excludeCharacter } = useGenshinData()
  const [result, setResult] = useState<RandomResult | null>(null)
  const [open, setOpen] = useState(false)
  const [randomizeType, setRandomizeType] = useState<"characters" | "bosses" | "combined">("characters")
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isAnimating, setIsAnimating] = useState(false)

  const fisherYatesShuffle = (array: any[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Check if all characters are currently selected
  const areAllCharactersSelected = result?.characters.every((char) => char.selected) || false

  // Function to animate items appearing one by one
  const animateResults = (newResult: RandomResult) => {
    setIsAnimating(true)

    // Initialize all items as not visible
    const initialResult = {
      characters: newResult.characters.map((char) => ({ ...char, visible: false })),
      bosses: newResult.bosses.map((boss) => ({ ...boss, visible: false })),
    }

    setResult(initialResult)

    // Animate bosses first, then characters
    const allItems = [
      ...initialResult.bosses.map((item, index) => ({ type: "boss", index })),
      ...initialResult.characters.map((item, index) => ({ type: "character", index })),
    ]

    // Reveal items one by one with a delay
    allItems.forEach((item, i) => {
      setTimeout(() => {
        setResult((prev) => {
          if (!prev) return prev

          if (item.type === "boss") {
            const updatedBosses = [...prev.bosses]
            updatedBosses[item.index] = { ...updatedBosses[item.index], visible: true }
            return { ...prev, bosses: updatedBosses }
          } else {
            const updatedCharacters = [...prev.characters]
            updatedCharacters[item.index] = { ...updatedCharacters[item.index], visible: true }
            return { ...prev, characters: updatedCharacters }
          }
        })

        // Set animating to false when all items are revealed
        if (i === allItems.length - 1) {
          setTimeout(() => setIsAnimating(false), 300)
        }
      }, i * 100) // 100ms delay between each item
    })
  }

  const getRandomizedCharacters = () => {
    // Step 1: Get eligible characters
    const enabledCharacters = characters.filter(
      (char) =>
        settings.characters.enabled[char.name] &&
        (!settings.enableExclusion || !settings.characters.excluded.includes(char.name)),
    )

    // Edge case: not enough characters in total
    if (enabledCharacters.length < settings.characters.count) {
      toast({
        title: t("rules.notEnoughCharacters.title"),
        description: t("rules.notEnoughCharacters.description"),
        variant: "destructive",
      })
      return null
    }

    // Step 2: Split by rules
    const travelers = enabledCharacters.filter((c) => c.name.startsWith("Traveler ("))
    const nonTravelers = enabledCharacters.filter((c) => !c.name.startsWith("Traveler ("))

    const candidatePool = [...nonTravelers]

    // Step 3: If coopMode is disabled, optionally add 1 random Traveler
    if (!settings.rules.coopMode && travelers.length > 0) {
      const randomTraveler = travelers[Math.floor(Math.random() * travelers.length)]
      candidatePool.push(randomTraveler)
    }

    // Step 4: Apply 5-star rule (if active)
    let finalCharacters: typeof characters = []

    if (settings.rules.limitFiveStars) {
      const max5 = settings.rules.maxFiveStars
      const count = settings.characters.count

      const fiveStars = candidatePool.filter((c) => c.rarity === 5)
      const fourStars = candidatePool.filter((c) => c.rarity < 5)

      if (fiveStars.length < max5 || fourStars.length < count - max5) {
        toast({
          title: t("rules.notEnoughCharacters.title"),
          description: t("rules.notEnoughCharacters.description"),
          variant: "destructive",
        })
        return null
      }

      const selected5 = [...fiveStars].sort(() => Math.random() - 0.5).slice(0, max5)
      const selected4 = [...fourStars].sort(() => Math.random() - 0.5).slice(0, count - selected5.length)

      finalCharacters = fisherYatesShuffle([...selected5, ...selected4])
    } else {
      // No 5-star limit, just take a random sample of the pool
      finalCharacters = fisherYatesShuffle(candidatePool).slice(0, settings.characters.count)
    }

    return finalCharacters.map((char) => ({ ...char, selected: false, visible: false }))
  }

  const getRandomizedBosses = () => {
    // Filter enabled bosses
    // If co-op mode is enabled, only include bosses with coop=true
    const enabledBosses = bosses.filter(
      (boss) => settings.bosses.enabled[boss.name] && (!settings.rules.coopMode || boss.coop),
    )

    // Check if we have enough enabled bosses
    if (enabledBosses.length < settings.bosses.count) {
      toast({
        title: t("rules.notEnoughBosses.title"),
        description: t("rules.notEnoughBosses.description").replace("{count}", settings.bosses.count.toString()),
        variant: "destructive",
      })
      return null
    }

    // Shuffle and select bosses
    const selectedBosses = fisherYatesShuffle([...enabledBosses])
      .slice(0, settings.bosses.count)
      .map((boss) => ({ ...boss, visible: false }))

    return selectedBosses
  }

  const handleRandomize = (type: "characters" | "bosses" | "combined") => {
    setRandomizeType(type)

    let selectedCharacters: any[] = []
    let selectedBosses: any[] = []

    if (type === "characters" || type === "combined") {
      const characters = getRandomizedCharacters()
      if (!characters) return // Error occurred
      selectedCharacters = characters
    }

    if (type === "bosses" || type === "combined") {
      const bosses = getRandomizedBosses()
      if (!bosses) return // Error occurred
      selectedBosses = bosses
    }

    const newResult = {
      characters: selectedCharacters,
      bosses: selectedBosses,
    }

    setOpen(true)
    animateResults(newResult)
  }

  const toggleCharacterSelection = (index: number) => {
    if (!result || isAnimating) return

    setResult({
      ...result,
      characters: result.characters.map((char, i) => (i === index ? { ...char, selected: !char.selected } : char)),
    })
  }

  const toggleAllCharacters = () => {
    if (!result || isAnimating) return

    // If all characters are currently selected, deselect all
    // Otherwise, select all
    const newSelectedState = !areAllCharactersSelected

    setResult({
      ...result,
      characters: result.characters.map((char) => ({ ...char, selected: newSelectedState })),
    })
  }

  const handleAcceptSelected = () => {
    if (!result || isAnimating) return

    // Get selected characters
    const selectedCharacters = result.characters.filter((char) => char.selected)

    if (selectedCharacters.length === 0) {
      toast({
        title: t("results.noCharactersSelected"),
        description: t("results.selectAtLeastOne"),
        variant: "destructive",
      })
      return
    }

    // Exclude selected characters
    selectedCharacters.forEach((char) => {
      excludeCharacter(char.name)
    })

    toast({
      title: t("results.charactersAccepted"),
      description: `${selectedCharacters.length} ${t("results.charactersExcluded")}`,
    })

    setOpen(false)
  }

  const handleBossClick = (link: string) => {
    if (isAnimating) return
    window.open(link, "_blank", "noopener,noreferrer")
  }

  // Function to process boss name - remove "⭐ - " prefix if present
  const processBossName = (name: string) => {
    if (name.startsWith("⭐ - ")) {
      return name.substring(4) // Remove the "⭐ - " prefix
    }
    return name
  }

  // Function to determine if a boss is a legend
  const isLegendBoss = (name: string) => {
    return name.startsWith("⭐ - ")
  }

  // Reset animation state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsAnimating(false)
    }
  }, [open])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="character-count">{t("main.characters")}</Label>
            <Input
              id="character-count"
              type="number"
              min="1"
              max={characters.length}
              value={settings.characters.count}
              onChange={(e) => updateCharacterCount(Number.parseInt(e.target.value) || 1)}
              className="w-20 ml-2"
            />
          </div>
          <Button
            onClick={() => handleRandomize("characters")}
            className="w-full button-enhanced"
            disabled={isAnimating}
          >
            <Dice5 className="mr-2 h-4 w-4" />
            {t("main.roll.characters")}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="boss-count">{t("main.bosses")}</Label>
            <Input
              id="boss-count"
              type="number"
              min="1"
              max={bosses.length}
              value={settings.bosses.count}
              onChange={(e) => updateBossCount(Number.parseInt(e.target.value) || 1)}
              className="w-20 ml-2"
            />
          </div>
          <Button onClick={() => handleRandomize("bosses")} className="w-full button-enhanced" disabled={isAnimating}>
            <Dice5 className="mr-2 h-4 w-4" />
            {t("main.roll.bosses")}
          </Button>
        </div>
      </div>

      <Button onClick={() => handleRandomize("combined")} className="w-full button-enhanced" disabled={isAnimating}>
        <Dices className="mr-2 h-4 w-4" />
        {t("main.roll.both")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl dialog-content">
          <DialogHeader>
            <DialogTitle>{t("results.title")}</DialogTitle>
          </DialogHeader>

          {result && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-1">
                {result.bosses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {t("main.bosses")} ({result.bosses.length})
                    </h3>
                    <div className="results-grid">
                      {result.bosses.map((boss) => (
                        <div
                          key={boss.name}
                          className={cn("transition-opacity duration-300", boss.visible ? "opacity-100" : "opacity-0")}
                        >
                          <Card
                            className={cn(
                              "overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all boss-card",
                              boss.visible && "animate-appear",
                            )}
                            onClick={() => handleBossClick(boss.link)}
                          >
                            <CardContent className="p-0 relative">
                              {/* Full-size boss image container */}
                              <div className="aspect-square relative overflow-hidden">
                                <div
                                  className={cn("absolute inset-0 z-0", isLegendBoss(boss.name) && "rarity-5-gradient")}
                                ></div>

                                {/* Boss image */}
                                <div className="boss-image-container">
                                  <Image
                                    src={`/bosses/${boss.location}/${boss.icon}?text=${encodeURIComponent(boss.name)}`}
                                    alt={processBossName(boss.name)}
                                    width={256}
                                    height={256}
                                    className="object-cover"
                                  />
                                </div>

                                {/* Location badge with distinct border - now in top-left corner */}
                                {isLegendBoss(boss.name) && (
                                  <div className="card-corner-element right">
                                    <Badge className="legend-badge">{t("main.legend")}</Badge>
                                  </div>
                                )}

                                {/* Boss info overlay - updated to match character layout */}
                                <div className="boss-info-overlay">
                                  <p
                                    className="text-sm font-medium truncate text-shadow"
                                    title={processBossName(boss.name)}
                                  >
                                    {processBossName(boss.name)}
                                  </p>
                                  <p className="text-xs text-white/80 text-shadow">{boss.location}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.characters.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {t("main.characters")} ({result.characters.length})
                    </h3>
                    <div className="results-grid">
                      {result.characters.map((character, index) => (
                        <div
                          key={character.name}
                          className={cn(
                            "transition-opacity duration-300",
                            character.visible ? "opacity-100" : "opacity-0",
                          )}
                        >
                          <Card
                            className={cn(
                              "overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all character-card",
                              character.selected ? "ring-2 ring-primary" : "",
                              character.visible && "animate-appear",
                              character.rarity === 5 ? "border-accent-5" : "border-accent-4",
                            )}
                            onClick={() => settings.enableExclusion && toggleCharacterSelection(index)}
                          >
                            <CardContent className="p-0 relative">
                              {/* Full-size character image container */}
                              <div className="aspect-square relative overflow-hidden">
                                <div
                                  className={cn(
                                    "absolute inset-0 z-0",
                                    character.rarity === 5 ? "rarity-5-gradient" : "rarity-4-gradient",
                                  )}
                                ></div>

                                {/* Character image */}
                                <div className="character-image-container">
                                  <Image
                                    src={`/characters/${character.element}/${character.icon}?text=${encodeURIComponent(character.name)}`}
                                    alt={character.name}
                                    width={256}
                                    height={256}
                                    className="object-cover"
                                  />
                                </div>

                                {/* Element icon in top-left corner */}
                                <div className="card-corner-element left">
                                  <div className="element-icon-container">
                                    <Image
                                      src={`/elements/${character.element}.webp?height=32&width=32`}
                                      alt={character.element}
                                      width={32}
                                      height={32}
                                      className="element-icon"
                                    />
                                  </div>
                                </div>

                                {/* Checkbox for selection */}
                                {settings.enableExclusion && (
                                  <div className="card-corner-element right">
                                    <div className="checkbox-container">
                                      <Checkbox
                                        checked={character.selected}
                                        onCheckedChange={() => toggleCharacterSelection(index)}
                                        id={`select-${character.name}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="checkbox-select"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Character info overlay */}
                                <div className="character-info-overlay">
                                  <p className="text-sm font-medium truncate text-shadow">{character.name}</p>
                                  <p className="text-xs text-white/80 text-shadow">
                                    {character.rarity === 5 ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {(randomizeType === "characters" || randomizeType === "combined") &&
                    result.characters.length > 0 &&
                    settings.enableExclusion && (
                      <Button
                        variant="outline"
                        onClick={toggleAllCharacters}
                        disabled={isAnimating}
                        className="button-enhanced"
                      >
                        {areAllCharactersSelected ? t("results.unselectAll") : t("results.selectAll")}
                      </Button>
                    )}
                  <Button
                    onClick={
                      randomizeType === "bosses" || !settings.enableExclusion || result.characters.length === 0
                        ? () => setOpen(false)
                        : handleAcceptSelected
                    }
                    disabled={isAnimating}
                    className="button-enhanced"
                  >
                    {randomizeType === "bosses" || !settings.enableExclusion || result.characters.length === 0
                      ? t("results.close")
                      : t("results.accept")}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
