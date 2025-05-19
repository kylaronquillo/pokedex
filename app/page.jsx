"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PokemonList from "@/components/pokemon-list"
import { fetchPokemons, searchPokemons } from "@/lib/pokemon"

export default function Home() {
  const [pokemons, setPokemons] = useState([])
  const [filteredPokemons, setFilteredPokemons] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("id_asc")
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const limit = 10

  // Load initial pokemons and when sort changes
  useEffect(() => {
    setOffset(0)
    setPokemons([])
    loadPokemons(0)
  }, [sortOption])

  // Filter locally (search)
  useEffect(() => {
    if (!isSearching) {
      let list = [...pokemons]
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        list = list.filter(
          p => p.name.toLowerCase().includes(q) || p.id.toString().includes(q)
        )
      }
      setFilteredPokemons(list)
    }
  }, [pokemons, searchQuery, isSearching])

  const loadPokemons = async (currentOffset) => {
    setLoading(true)
    try {
      const newPokemons = await fetchPokemons(currentOffset, limit, sortOption)
      setPokemons(prev => [...prev, ...newPokemons])
      setOffset(currentOffset + limit)
    } catch (err) {
      console.error("Error loading pokemons:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async e => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim()) {
      setIsSearching(true)
      setLoading(true)
      try {
        const results = await searchPokemons(value)
        // Sort search results according to current sort option
        const [field, dir] = sortOption.split("_")
        if (field === "name") {
          results.sort((a, b) => 
            dir === "asc" 
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name)
          )
        } else {
          results.sort((a, b) => 
            dir === "asc"
              ? a.id - b.id
              : b.id - a.id
          )
        }
        setFilteredPokemons(results)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    } else {
      setIsSearching(false)
      setFilteredPokemons(pokemons)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Pokédex</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search by name or ID"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={sortOption}
            onValueChange={value => setSortOption(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id_asc">ID Ascending</SelectItem>
              <SelectItem value="id_desc">ID Descending</SelectItem>
              <SelectItem value="name_asc">Name Ascending</SelectItem>
              <SelectItem value="name_desc">Name Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && <p className="text-center">Loading Pokémons...</p>}

      <PokemonList pokemons={filteredPokemons} />

      {!loading && filteredPokemons.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No Pokémon found
        </p>
      )}

      {!searchQuery && !isSearching && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => loadPokemons(offset)} disabled={loading} className="px-8">
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </main>
  )
}