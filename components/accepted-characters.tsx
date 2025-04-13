"use client"

import { useGenshinData } from "./genshin-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AcceptedCharacters() {
  const { characters, settings } = useGenshinData()

  // Get excluded characters with their full data
  const excludedCharacters = characters.filter((char) => settings.characters.excluded.includes(char.name))

  if (excludedCharacters.length === 0 || !settings.enableExclusion) {
    return null
  }

  return (
    <Card className="w-full max-w-md mt-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Picked Characters ({excludedCharacters.length})</CardTitle>
          <Link href="/settings?tab=excluded">
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-24">
          <div className="flex flex-wrap gap-2">
            {excludedCharacters.map((character) => (
              <Badge key={character.name} variant="outline" className="flex items-center gap-1 px-2 py-1">
                <div className="w-4 h-4 relative">
                  <Image
                    src={`/characters/${character.element}/${character.icon}?height=16&width=16`}
                    alt={character.name}
                    width={16}
                    height={16}
                    className="object-cover rounded-full"
                  />
                </div>
                {character.name}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
