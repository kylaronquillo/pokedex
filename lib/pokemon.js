// Helper functions for fetching and processing Pokemon data

// Format the Pokemon image URL based on ID
export const getPokemonImageUrl = (id) => {
  return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id.toString().padStart(3, "0")}.png`
}

// Search for Pokemon by name or ID
export const searchPokemons = async (query) => {
  try {
    // If the query is a number, try to fetch that specific Pokemon
    if (!isNaN(query) && query.trim() !== "") {
      const pokemon = await fetchPokemonDetails(parseInt(query))
      return pokemon ? [pokemon] : []
    }

    // Otherwise, fetch all Pokemon and filter by name
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000")
    const data = await response.json()
    
    const filteredResults = data.results.filter(pokemon => 
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    )

    // Fetch details for filtered Pokemon
    const searchResults = await Promise.all(
      filteredResults.map(async (pokemon) => {
        const id = Number.parseInt(pokemon.url.split("/").filter(Boolean).pop() || "0")
        const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        const detailData = await detailResponse.json()

        return {
          id,
          name: detailData.name,
          types: detailData.types.map((type) => type.type.name),
        }
      })
    )

    return searchResults
  } catch (error) {
    console.error("Error searching pokemons:", error)
    return []
  }
}

// Fetch a list of Pokemons with pagination
export const fetchPokemons = async (offset, limit, sortBy = "id") => {
  try {
    // For ID sorting, use regular pagination
    if (sortBy === "id") {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
      const data = await response.json()
      
      // Fetch detailed information for each Pokemon
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          const id = Number.parseInt(pokemon.url.split("/").filter(Boolean).pop() || "0")
          const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          const detailData = await detailResponse.json()

          return {
            id,
            name: detailData.name,
            types: detailData.types.map((type) => type.type.name),
          }
        })
      )

      return pokemonDetails
    } 
    // For name sorting, fetch all and sort
    else {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=1000`)
      const data = await response.json()
      
      let results = data.results
      results.sort((a, b) => a.name.localeCompare(b.name))
      results = results.slice(offset, offset + limit)

      // Fetch detailed information for sorted slice
      const pokemonDetails = await Promise.all(
        results.map(async (pokemon) => {
          const id = Number.parseInt(pokemon.url.split("/").filter(Boolean).pop() || "0")
          const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          const detailData = await detailResponse.json()

          return {
            id,
            name: detailData.name,
            types: detailData.types.map((type) => type.type.name),
          }
        })
      )

      return pokemonDetails
    }
  } catch (error) {
    console.error("Error fetching pokemons:", error)
    return []
  }
}

// Fetch detailed information for a specific Pokemon
export const fetchPokemonDetails = async (id) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)

    if (!response.ok) {
      throw new Error(`Pokemon with ID ${id} not found`)
    }

    const data = await response.json()

    return {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map((type) => type.type.name),
      abilities: data.abilities.map((ability) => ability.ability.name),
      stats: data.stats.map((stat) => ({
        name: stat.stat.name,
        value: stat.base_stat,
      })),
      species: data.species.name,
    }
  } catch (error) {
    console.error(`Error fetching pokemon details for ID ${id}:`, error)
    return null
  }
}

// Get Pokemon weaknesses based on types
export const getTypeWeaknesses = (types) => {
  const typeWeaknesses = {
    normal: ["rock", "steel", "fighting"],
    fire: ["rock", "fire", "water", "dragon"],
    water: ["water", "grass", "dragon"],
    electric: ["ground", "grass", "electric", "dragon"],
    grass: ["flying", "poison", "bug", "steel", "fire", "grass", "dragon"],
    ice: ["steel", "fire", "water", "ice"],
    fighting: ["flying", "psychic", "fairy"],
    poison: ["poison","ground", "rock", "ghost", "steel"],
    ground: ["flying","bug", "grass"],
    flying: ["rock", "steel", "electric"],
    psychic: ["steel", "psychic", "dark"],
    bug: ["fighting", "flying", "poison", "ghost", "steel", "fire", "fairy"],
    rock: ["fighting", "ground", "steel"],
    ghost: ["normal","ghost", "dark"],
    dragon: ["steel", "fairy"],
    dark: ["fighting", "dark", "fairy"],
    steel: ["steel", "fire", "water", "electric"],
    fairy: ["poison", "steel", "fire"],
  }

  // Combine all weaknesses for the Pokemon's types
  const allWeaknesses = types.flatMap((type) => typeWeaknesses[type] || [])

  // Remove duplicates and return unique weaknesses
  return [...new Set(allWeaknesses)]
}
