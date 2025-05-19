"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { getTypeColor } from "@/lib/pokemon-types"
import { fetchPokemonDetails, getPokemonImageUrl, getTypeWeaknesses } from "@/lib/pokemon"

export default function PokemonDetail({ params }) {
  const router = useRouter()
  const { id } = params
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPokemonDetails = async () => {
      setLoading(true)
      try {
        const details = await fetchPokemonDetails(id)
        setPokemon(details)
      } catch (error) {
        console.error("Error loading pokemon details:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPokemonDetails()
  }, [id])

  const handlePrevious = () => {
    if (pokemon && pokemon.id > 1) {
      router.push(`/pokemon/${pokemon.id - 1}`)
    }
  }

  const handleNext = () => {
    if (pokemon) {
      router.push(`/pokemon/${pokemon.id + 1}`)
    }
  }


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pokédex
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <Skeleton className="h-64 w-64 rounded-md" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // if (!pokemon) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="flex items-center mb-6">
  //         <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
  //           <ArrowLeft className="mr-2 h-4 w-4" />
  //           Back to Pokédex
  //         </Link>
  //       </div>
  //       <div className="text-center py-12">
  //         <h2 className="text-2xl font-bold">Pokémon not found</h2>
  //         <p className="text-muted-foreground mt-2">The Pokémon you're looking for doesn't exist.</p>
  //       </div>
  //     </div>
  //   )
  // }

  const weaknesses = getTypeWeaknesses(pokemon.types)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pokédex
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious} disabled={pokemon.id <= 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Pokémon</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Pokémon</span>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="overflow-hidden">
          <div className="p-8 flex justify-center items-center">
            <Image
              src={getPokemonImageUrl(pokemon.id) || "/placeholder.svg"}
              alt={pokemon.name}
              width={500}
              height={500}
              className="object-contain"
              priority
            />
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground">#{pokemon.id.toString().padStart(3, "0")}</div>
            <h1 className="text-3xl font-bold capitalize">{pokemon.name}</h1>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Types</h2>
            <div className="flex flex-wrap gap-2">
              {pokemon.types.map((type, index) => (
                <Badge key={`${type}-${index}`} className={`${getTypeColor(type)} text-white px-3 py-1`}>
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Weaknesses</h2>
            <div className="flex flex-wrap gap-2">
              {weaknesses.map((type, index) => (
                <Badge 
                  key={`${type}-${index}`} 
                  variant="static"
                  className={`${getTypeColor(type)} text-white px-3 py-1`}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Height</h2>
              <p>{(pokemon.height / 10).toFixed(1)} m</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Weight</h2>
              <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
            </div>
            {pokemon.abilities && (
              <div className="col-span-2">
                <h2 className="text-lg font-semibold mb-2">Abilities</h2>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {ability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Stats</h2>
            <div className="space-y-3">
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="capitalize text-sm">{stat.name}</span>
                    <span className="text-sm font-medium">{stat.value}</span>
                  </div>
                  <Progress value={(stat.value / 255) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
