"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { RefreshCw } from "lucide-react"

export default function ExcludedCharacters() {
  const { characters, settings, includeCharacter, toggleExclusion } = useGenshinData()

  // Get excluded characters with their full data
  const excludedCharacters = characters.filter((char) => settings.characters.excluded.includes(char.name))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="enable-exclusion" checked={settings.enableExclusion} onCheckedChange={toggleExclusion} />
          <Label htmlFor="enable-exclusion">Enable character exclusion</Label>
        </div>

        {excludedCharacters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              settings.characters.excluded.forEach((name) => {
                includeCharacter(name)
              })
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Excluded Characters ({excludedCharacters.length})</h3>

        {excludedCharacters.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No characters have been excluded yet. When you accept characters from the randomizer, they will appear here.
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {excludedCharacters.map((character) => (
                <Card
                  key={character.name}
                  className="overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => includeCharacter(character.name)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                      <div className="absolute top-0 right-0 z-10">
                        <Badge variant="secondary" className="m-1">
                          {character.element}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center h-full">
                        <Image
                          src={`/placeholder.svg?height=80&width=80&text=${encodeURIComponent(character.name)}`}
                          alt={character.name}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">Click to Re-enable</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium truncate">{character.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {character.rarity === "5" ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
