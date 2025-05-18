"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PokemonList from "@/components/pokemon-list"
import { fetchPokemons, searchPokemons } from "@/lib/pokemon"

export default function Home() {
  const [pokemons, setPokemons] = useState([])
  const [filteredPokemons, setFilteredPokemons] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("id")
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const limit = 10

  useEffect(() => {
    loadPokemons()
  }, [])

  useEffect(() => {
    if (!isSearching) {
      let filtered = [...pokemons]

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (pokemon) =>
            pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pokemon.id.toString().includes(searchQuery),
        )
      }

      // Sort by selected option
      if (sortBy === "id") {
        filtered.sort((a, b) => a.id - b.id)
      } else if (sortBy === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name))
      }

      setFilteredPokemons(filtered)
    }
  }, [pokemons, searchQuery, sortBy, isSearching])

  const loadPokemons = async () => {
    setLoading(true)
    try {
      const newPokemons = await fetchPokemons(offset, limit)
      // Add new pokemons while preventing duplicates
      setPokemons((prev) => {
        const uniquePokemons = [...prev]
        newPokemons.forEach((newPokemon) => {
          if (!uniquePokemons.some((p) => p.id === newPokemon.id)) {
            uniquePokemons.push(newPokemon)
          }
        })
        return uniquePokemons
      })
      setOffset((prev) => prev + limit)
    } catch (error) {
      console.error("Error loading pokemons:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim()) {
      setIsSearching(true)
      setLoading(true)
      try {
        const searchResults = await searchPokemons(value)
        setFilteredPokemons(searchResults)
      } catch (error) {
        console.error("Error searching pokemons:", error)
      } finally {
        setLoading(false)
      }
    } else {
      setIsSearching(false)
      setFilteredPokemons(pokemons)
    }
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    if (!isSearching) {
      let sorted = [...filteredPokemons]
      if (value === "id") {
        sorted.sort((a, b) => a.id - b.id)
      } else if (value === "name") {
        sorted.sort((a, b) => a.name.localeCompare(b.name))
      }
      setFilteredPokemons(sorted)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Pokédex</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input placeholder="Search by name or ID" value={searchQuery} onChange={handleSearch} className="w-full" />
        </div>
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Sort by ID</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PokemonList pokemons={filteredPokemons} />

      {filteredPokemons.length === 0 && !loading && (
        <p className="text-center text-muted-foreground mt-8">No Pokémon found</p>
      )}

      {pokemons.length > 0 && filteredPokemons.length > 0 && !searchQuery && !isSearching && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadPokemons} disabled={loading} className="px-8">
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </main>
  )
}
