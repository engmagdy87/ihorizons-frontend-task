const POKEMON_KEY = "pokemons";
const POKEMON_PAGINATION_KEY = "pokemon_pagination";

export interface CachedPokemon {
  id: number;
  name: string;
}

export interface PaginationState {
  currentPage: number;
  totalLoaded: number;
  hasMore: boolean;
  lastFetchTime: number;
}

const loadPokemonList = (): CachedPokemon[] | undefined => {
  try {
    const data = localStorage.getItem(POKEMON_KEY);
    if (data === null) {
      return undefined;
    }
    return JSON.parse(data);
  } catch (err) {
    return undefined;
  }
};

const savePokemonList = (pokemonList: CachedPokemon[]): void => {
  try {
    const data = JSON.stringify(pokemonList);
    localStorage.setItem(POKEMON_KEY, data);
  } catch (error) {
    console.warn("Failed to save Pokemon list to localStorage:", error);
  }
};

const loadPaginationState = (): PaginationState | undefined => {
  try {
    const data = localStorage.getItem(POKEMON_PAGINATION_KEY);
    if (data === null) {
      return undefined;
    }
    return JSON.parse(data);
  } catch (err) {
    return undefined;
  }
};

const savePaginationState = (state: PaginationState): void => {
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(POKEMON_PAGINATION_KEY, data);
  } catch (error) {
    console.warn("Failed to save pagination state to localStorage:", error);
  }
};

const clearPokemonData = (): void => {
  try {
    localStorage.removeItem(POKEMON_KEY);
    localStorage.removeItem(POKEMON_PAGINATION_KEY);
  } catch (error) {
    console.warn("Failed to clear Pokemon data from localStorage:", error);
  }
};

// Legacy exports for backward compatibility
const loadState = loadPokemonList;
const saveState = (state: any[]): void => {
  console.warn("saveState is deprecated, use savePokemonList instead");
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(POKEMON_KEY, data);
  } catch (error) {
    // Silent catch
  }
};

export {
  loadState,
  saveState,
  loadPokemonList,
  savePokemonList,
  loadPaginationState,
  savePaginationState,
  clearPokemonData,
};
