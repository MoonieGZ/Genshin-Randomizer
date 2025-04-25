"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { RefreshCw } from "lucide-react"
import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

export default function ExcludedCharacters() {
  const { characters, settings, includeCharacter, toggleExclusion } = useGenshinData()
  const { t } = useLanguage()

  // Get excluded characters with their full data
  const excludedCharacters = characters.filter((char) => settings.characters.excluded.includes(char.name))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="enable-exclusion" checked={settings.enableExclusion} onCheckedChange={toggleExclusion} />
          <Label htmlFor="enable-exclusion">{t("excluded.enableExclusion")}</Label>
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
            {t("excluded.resetAll")}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t("excluded.title")} ({excludedCharacters.length})
        </h3>

        {excludedCharacters.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t("excluded.noCharacters")}</p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="results-grid">
              {excludedCharacters.map((character) => (
                <Card
                  key={character.name}
                  className={cn(
                    "overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-primary transition-all character-card",
                    character.rarity === 5 ? "border-accent-5" : "border-accent-4",
                  )}
                  onClick={() => includeCharacter(character.name)}
                >
                  <CardContent className="p-0 relative">
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
                          src={`/characters/${character.element}/${character.icon}?height=200&width=200&text=${encodeURIComponent(character.name)}`}
                          alt={character.name}
                          width={200}
                          height={200}
                          className="object-cover"
                        />
                      </div>

                      {/* Element icon in top-left corner - UPDATED */}
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

                      {/* Character info overlay */}
                      <div className="character-info-overlay">
                        <p className="text-sm font-medium truncate text-shadow">{character.name}</p>
                        <p className="text-xs text-white/80 text-shadow">
                          {character.rarity === 5 ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                        </p>
                      </div>

                      {/* Re-enable overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                        <span className="text-white font-medium text-shadow">{t("excluded.clickToReEnable")}</span>
                      </div>
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
