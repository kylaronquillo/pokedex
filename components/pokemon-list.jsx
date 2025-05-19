"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPokemonImageUrl } from "@/lib/pokemon"
import { getTypeColor } from "@/lib/pokemon-types"


export default function PokemonList({ pokemons }) {
  if (!pokemons || pokemons.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {pokemons.map((pokemon) => (
        <Link href={`/pokemon/${pokemon.id}`} key={pokemon.id}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="bg-muted p-4 flex justify-center">
              <Image
                src={getPokemonImageUrl(pokemon.id) || "/placeholder.svg"}
                alt={pokemon.name}
                width={150}
                height={150}
                className="object-contain h-32 w-32"
                priority={pokemon.id <= 10}
              />
            </div>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">#{pokemon.id.toString().padStart(3, "0")}</div>
              <h2 className="text-xl font-bold capitalize mb-2">{pokemon.name}</h2>
              <div className="flex flex-wrap gap-2">
                {pokemon.types.map((type, index) => (
                  <Badge key={`${pokemon.id}-${type}-${index}`} className={`${getTypeColor(type)} text-white`}>
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
