"use client"

import { useState } from "react"
import { useGenshinData } from "./genshin-data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dice5 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

type RandomResult = {
  characters: Array<{
    name: string
    rarity: string
    element: string
    icon: string
    selected?: boolean
  }>
  bosses: Array<{
    name: string
    icon: string
    location: string
  }>
}

export default function RandomizerForm() {
  const { characters, bosses, settings, updateCharacterCount, updateBossCount, excludeCharacter } = useGenshinData()
  const [result, setResult] = useState<RandomResult | null>(null)
  const [open, setOpen] = useState(false)
  const [randomizeType, setRandomizeType] = useState<"characters" | "bosses">("characters")
  const { toast } = useToast()

  const handleRandomize = (type: "characters" | "bosses") => {
    setRandomizeType(type)

    // Filter enabled characters and bosses
    const enabledCharacters = characters.filter(
      (char) =>
        settings.characters.enabled[char.name] &&
        (!settings.enableExclusion || !settings.characters.excluded.includes(char.name)),
    )
    const enabledBosses = bosses.filter((boss) => settings.bosses.enabled[boss.name])

    // Check if we have enough enabled items
    if (type === "characters" && enabledCharacters.length < settings.characters.count) {
      toast({
        title: "Not enough characters enabled",
        description: `Please enable at least ${settings.characters.count} characters in settings.`,
        variant: "destructive",
      })
      return
    }

    if (type === "bosses" && enabledBosses.length < settings.bosses.count) {
      toast({
        title: "Not enough bosses enabled",
        description: `Please enable at least ${settings.bosses.count} bosses in settings.`,
        variant: "destructive",
      })
      return
    }

    // Shuffle arrays
    const shuffledCharacters = [...enabledCharacters].sort(() => Math.random() - 0.5)
    const shuffledBosses = [...enabledBosses].sort(() => Math.random() - 0.5)

    // Take the required number of items
    const selectedCharacters =
      type === "bosses"
        ? []
        : shuffledCharacters.slice(0, settings.characters.count).map((char) => ({ ...char, selected: false }))
    const selectedBosses = type === "characters" ? [] : shuffledBosses.slice(0, settings.bosses.count)

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

  return (
    <div className="space-y-6">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Randomization Results</DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-6">
              {result.bosses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bosses ({result.bosses.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {result.bosses.map((boss) => (
                      <Card key={boss.name} className="overflow-hidden">
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
                              {character.rarity === "5" ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={
                    randomizeType === "bosses" || !settings.enableExclusion
                      ? () => setOpen(false)
                      : handleAcceptSelected
                  }
                >
                  {randomizeType === "bosses" || !settings.enableExclusion ? "Close" : "Accept"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
