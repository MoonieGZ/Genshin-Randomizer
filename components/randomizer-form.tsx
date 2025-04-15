"use client"

import { useState } from "react"
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

type RandomResult = {
  characters: Array<{
    name: string
    rarity: number
    element: string
    icon: string
    selected?: boolean
  }>
  bosses: Array<{
    name: string
    icon: string
    location: string
    link: string
  }>
}

export default function RandomizerForm() {
  const { characters, bosses, settings, updateCharacterCount, updateBossCount, excludeCharacter } = useGenshinData()
  const [result, setResult] = useState<RandomResult | null>(null)
  const [open, setOpen] = useState(false)
  const [randomizeType, setRandomizeType] = useState<"characters" | "bosses" | "combined">("characters")
  const { toast } = useToast()

  // Check if all characters are currently selected
  const areAllCharactersSelected = result?.characters.every((char) => char.selected) || false

  const getRandomizedCharacters = () => {
    // Filter enabled characters
    const enabledCharacters = characters.filter(
      (char) =>
        settings.characters.enabled[char.name] &&
        (!settings.enableExclusion || !settings.characters.excluded.includes(char.name)),
    )

    // Check if we have enough enabled characters
    if (enabledCharacters.length < settings.characters.count) {
      toast({
        title: "Not enough characters enabled",
        description: `Please enable at least ${settings.characters.count} characters in settings.`,
        variant: "destructive",
      })
      return null
    }

    // Shuffle characters
    const shuffledCharacters = [...enabledCharacters].sort(() => Math.random() - 0.5)

    // Apply rules for character selection
    let filteredCharacters = [...shuffledCharacters]

    // Apply co-op mode rule if needed
    if (!settings.rules.coopMode) {
      const travelerCharacters = shuffledCharacters.filter((char) => char.name.startsWith("Traveler ("))
      const nonTravelerCharacters = shuffledCharacters.filter((char) => !char.name.startsWith("Traveler ("))

      filteredCharacters = nonTravelerCharacters

      if (travelerCharacters.length > 0) {
        // Pick a random Traveler from the remaining eligible ones
        const selectedTraveler = travelerCharacters[Math.floor(Math.random() * travelerCharacters.length)]
        filteredCharacters.push(selectedTraveler)
      }

      // Shuffle final result so no fixed positions
      filteredCharacters = filteredCharacters.sort(() => Math.random() - 0.5)

      // Update the filtered list
      filteredCharacters = filteredCharacters.slice(0, settings.characters.count)
    } else {
      filteredCharacters = shuffledCharacters.slice(0, settings.characters.count)
    }

    // Apply 5-star character limit rule if enabled
    let selectedCharacters: any[] = []
    if (settings.rules.limitFiveStars) {
      const fiveStarCharacters: any[] = []
      const fourStarCharacters: any[] = []

      // Separate 5-star and 4-star characters from the filtered list
      filteredCharacters.forEach((char) => {
        if (char.rarity === 5) {
          fiveStarCharacters.push(char)
        } else {
          fourStarCharacters.push(char)
        }
      })

      // Take limited number of 5-star characters
      const selectedFiveStars = fiveStarCharacters.slice(
        0,
        Math.min(settings.rules.maxFiveStars, settings.characters.count),
      )

      // Fill the rest with 4-star characters
      const remainingSlots = settings.characters.count - selectedFiveStars.length
      const selectedFourStars = fourStarCharacters.slice(0, remainingSlots)

      // Combine and shuffle again
      selectedCharacters = [...selectedFiveStars, ...selectedFourStars]
        .sort(() => Math.random() - 0.5)
        .map((char) => ({ ...char, selected: false }))
    } else {
      // No 5-star limit, just take the filtered characters
      selectedCharacters = filteredCharacters.map((char) => ({ ...char, selected: false }))
    }

    // Check if we have enough characters after applying all rules
    if (selectedCharacters.length < settings.characters.count) {
      toast({
        title: "Not enough characters available",
        description: `Could only select ${selectedCharacters.length} characters after applying all rules. Consider adjusting your settings.`,
        variant: "destructive",
      })
    }

    return selectedCharacters
  }

  const getRandomizedBosses = () => {
    // Filter enabled bosses
    const enabledBosses = bosses.filter((boss) => settings.bosses.enabled[boss.name])

    // Check if we have enough enabled bosses
    if (enabledBosses.length < settings.bosses.count) {
      toast({
        title: "Not enough bosses enabled",
        description: `Please enable at least ${settings.bosses.count} bosses in settings.`,
        variant: "destructive",
      })
      return null
    }

    // Shuffle and select bosses
    const selectedBosses = [...enabledBosses].sort(() => Math.random() - 0.5).slice(0, settings.bosses.count)

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

    setResult({
      characters: selectedCharacters,
      bosses: selectedBosses,
    })

    setOpen(true)
  }

  const toggleCharacterSelection = (index: number) => {
    if (!result) return

    setResult({
      ...result,
      characters: result.characters.map((char, i) => (i === index ? { ...char, selected: !char.selected } : char)),
    })
  }

  const toggleAllCharacters = () => {
    if (!result) return

    // If all characters are currently selected, deselect all
    // Otherwise, select all
    const newSelectedState = !areAllCharactersSelected

    setResult({
      ...result,
      characters: result.characters.map((char) => ({ ...char, selected: newSelectedState })),
    })
  }

  const handleAcceptSelected = () => {
    if (!result) return

    // Get selected characters
    const selectedCharacters = result.characters.filter((char) => char.selected)

    if (selectedCharacters.length === 0) {
      toast({
        title: "No characters selected",
        description: "Please select at least one character to accept.",
        variant: "destructive",
      })
      return
    }

    // Exclude selected characters
    selectedCharacters.forEach((char) => {
      excludeCharacter(char.name)
    })

    toast({
      title: "Characters accepted",
      description: `${selectedCharacters.length} character(s) have been excluded from future rolls.`,
    })

    setOpen(false)
  }

  const handleBossClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="character-count">Characters</Label>
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
          <Button onClick={() => handleRandomize("characters")} className="w-full">
            <Dice5 className="mr-2 h-4 w-4" />
            Roll Characters
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="boss-count">Bosses</Label>
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
          <Button onClick={() => handleRandomize("bosses")} className="w-full">
            <Dice5 className="mr-2 h-4 w-4" />
            Roll Bosses
          </Button>
        </div>
      </div>

      <Button onClick={() => handleRandomize("combined")} className="w-full">
        <Dices className="mr-2 h-4 w-4" />
        Roll Both
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Randomization Results</DialogTitle>
          </DialogHeader>

          {result && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-1">
                {result.bosses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bosses ({result.bosses.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {result.bosses.map((boss) => (
                        <Card
                          key={boss.name}
                          className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => handleBossClick(boss.link)}
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                              <div className="absolute top-0 right-0 z-10">
                                <Badge variant="outline" className="m-1">
                                  {boss.location}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-center h-full">
                                <Image
                                  src={`/bosses/${boss.location}/${boss.icon}?height=80&width=80&text=${encodeURIComponent(boss.name)}`}
                                  alt={boss.name}
                                  width={80}
                                  height={80}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-wrap min-h-[40px] flex items-center justify-center">
                                {boss.name}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {result.characters.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Characters ({result.characters.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {result.characters.map((character, index) => (
                        <Card
                          key={character.name}
                          className={`overflow-hidden cursor-pointer ${character.selected ? "ring-2 ring-primary" : ""}`}
                          onClick={() => settings.enableExclusion && toggleCharacterSelection(index)}
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                              <div className="absolute top-0 right-0 z-10">
                                <Badge variant="secondary" className="m-1">
                                  {character.element}
                                </Badge>
                              </div>
                              {settings.enableExclusion && (
                                <div className="absolute top-0 left-0 z-10 m-1">
                                  <Checkbox
                                    checked={character.selected}
                                    onCheckedChange={() => toggleCharacterSelection(index)}
                                    id={`select-${character.name}`}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                              <div className="flex items-center justify-center h-full">
                                <Image
                                  src={`/characters/${character.element}/${character.icon}?height=80&width=80&text=${encodeURIComponent(character.name)}`}
                                  alt={character.name}
                                  width={80}
                                  height={80}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-wrap min-h-[40px] flex items-center justify-center">
                                {character.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {character.rarity === 5 ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {(randomizeType === "characters" || randomizeType === "combined") &&
                    result.characters.length > 0 &&
                    settings.enableExclusion && (
                      <Button variant="outline" onClick={toggleAllCharacters}>
                        {areAllCharactersSelected ? "Unselect All" : "Select All"}
                      </Button>
                    )}
                  <Button
                    onClick={
                      randomizeType === "bosses" || !settings.enableExclusion || result.characters.length === 0
                        ? () => setOpen(false)
                        : handleAcceptSelected
                    }
                  >
                    {randomizeType === "bosses" || !settings.enableExclusion || result.characters.length === 0
                      ? "Close"
                      : "Accept"}
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
