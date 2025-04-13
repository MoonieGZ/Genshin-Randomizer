"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Card, CardContent } from "@/components/ui/card"

export function PoolInfo() {
  const { characters, bosses, settings } = useGenshinData()
  
  const availableCharacters = characters.filter(
    (char) => 
        settings.characters.enabled[char.name] &&
        (!settings.enableExclusion || !settings.characters.excluded.includes(char.name)),
    ).length

  const availableBosses = bosses.filter(
    (boss) => settings.bosses.enabled[boss.name]).length  

  return (
    <Card className="mb-4">
        <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Available Characters</p>
                    <p className="text-2xl font-bold">{availableCharacters}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Available Bosses</p>
                    <p className="text-2xl font-bold">{availableBosses}</p>
                </div>
            </div>
        </CardContent>
    </Card>
  )  
}