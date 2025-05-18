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
export const fetchPokemons = async (offset, limit) => {
  try {
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
      }),
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
    normal: ["fighting"],
    fire: ["water", "ground", "rock"],
    water: ["electric", "grass"],
    electric: ["ground"],
    grass: ["fire", "ice", "poison", "flying", "bug"],
    ice: ["fire", "fighting", "rock", "steel"],
    fighting: ["flying", "psychic", "fairy"],
    poison: ["ground", "psychic"],
    ground: ["water", "grass", "ice"],
    flying: ["electric", "ice", "rock"],
    psychic: ["bug", "ghost", "dark"],
    bug: ["fire", "flying", "rock"],
    rock: ["water", "grass", "fighting", "ground", "steel"],
    ghost: ["ghost", "dark"],
    dragon: ["ice", "dragon", "fairy"],
    dark: ["fighting", "bug", "fairy"],
    steel: ["fire", "fighting", "ground"],
    fairy: ["poison", "steel"],
  }

  // Combine all weaknesses for the Pokemon's types
  const allWeaknesses = types.flatMap((type) => typeWeaknesses[type] || [])

  // Remove duplicates and return unique weaknesses
  return [...new Set(allWeaknesses)]
}
