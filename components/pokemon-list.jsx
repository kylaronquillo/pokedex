"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPokemonImageUrl } from "@/lib/pokemon"

export default function PokemonList({ pokemons }) {
  if (!pokemons || pokemons.length === 0) {
    return null
  }

  const getTypeColor = (type) => {
    const typeColors = {
      normal: "bg-gray-400",
      fire: "bg-orange-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-300",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-700",
      flying: "bg-indigo-300",
      psychic: "bg-pink-500",
      bug: "bg-lime-500",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    }

    return typeColors[type] || "bg-gray-400"
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
                  <Badge key={`${type}-${index}`} className={`${getTypeColor(type)} text-white`}>
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
