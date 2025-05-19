// Helper functions for fetching and processing Pokemon data

// Maximum Pokemon ID to fetch
const MAX_POKEMON_ID = 1025

// Format the Pokemon image URL based on ID
export const getPokemonImageUrl = (id) => {
  return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id.toString().padStart(3, "0")}.png`
}

// Get total count of Pokemon up to our maximum limit
export const getTotalPokemonCount = async () => {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon")
    const data = await response.json()
    return Math.min(data.count, MAX_POKEMON_ID)
  } catch (error) {
    console.error("Error getting total Pokemon count:", error)
    return 0
  }
}

// Search for Pokemon by name or ID
export const searchPokemons = async (query) => {
  try {
    // If the query is a number, try to fetch that specific Pokemon
    if (!isNaN(query) && query.trim() !== "") {
      const id = parseInt(query)
      if (id > MAX_POKEMON_ID) {
        return []
      }
      const pokemon = await fetchPokemonDetails(id)
      return pokemon ? [pokemon] : []
    }

    // Get total count of Pokemon
    const totalCount = await getTotalPokemonCount()
    
    // Fetch all Pokemon
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${totalCount}`)
    const data = await response.json()
    
    const filteredResults = data.results
      .map(pokemon => ({
        ...pokemon,
        id: Number.parseInt(pokemon.url.split("/").filter(Boolean).pop() || "0")
      }))
      .filter(pokemon => 
        pokemon.id <= MAX_POKEMON_ID && 
        pokemon.name.toLowerCase().includes(query.toLowerCase())
      )

    // Fetch details for filtered Pokemon
    const searchResults = await Promise.all(
      filteredResults.map(async (pokemon) => {
        const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
        const detailData = await detailResponse.json()

        return {
          id: pokemon.id,
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

// Fetch a list of Pokemons with pagination and sorting
export const fetchPokemons = async (offset, limit, sortOption = "id_asc") => {
  try {
    // Get total count of Pokemon
    const totalCount = await getTotalPokemonCount()
    
    // Fetch all Pokemon to enable proper sorting
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${totalCount}`)
    const data = await response.json()
    
    // Add IDs to the results for sorting and filter by max ID
    let results = data.results
      .map(pokemon => ({
        ...pokemon,
        id: Number.parseInt(pokemon.url.split("/").filter(Boolean).pop() || "0")
      }))
      .filter(pokemon => pokemon.id <= MAX_POKEMON_ID)

    // Sort based on the sortOption
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

    // Apply pagination after sorting
    results = results.slice(offset, offset + limit)

    // Fetch detailed information for the paginated results
    const pokemonDetails = await Promise.all(
      results.map(async (pokemon) => {
        const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
        const detailData = await detailResponse.json()

        return {
          id: pokemon.id,
          name: detailData.name,
          types: detailData.types.map((type) => type.type.name),
        }
      })
    )

    return pokemonDetails
  } catch (error) {
    console.error("Error fetching pokemons:", error)
    return []
  }
}

// Fetch detailed information for a specific Pokemon
export const fetchPokemonDetails = async (id) => {
  try {
    if (id > MAX_POKEMON_ID) {
      throw new Error(`Pokemon with ID ${id} exceeds the maximum supported ID of ${MAX_POKEMON_ID}`)
    }

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
    steel: ["steel", "fire", "fighting", "ground"],
    fairy: ["poison", "steel"],
  }

  // Combine all weaknesses for the Pokemon's types
  const allWeaknesses = types.flatMap((type) => typeWeaknesses[type] || [])

  // Remove duplicates and return unique weaknesses
  return [...new Set(allWeaknesses)]
}
