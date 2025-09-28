import { useCallback, useEffect, useState } from "react";
import {
  loadPokemonList,
  savePokemonList,
  loadPaginationState,
  savePaginationState,
  clearPokemonData,
  CachedPokemon,
  PaginationState,
} from "../helpers/localStorage";
import { useGetPokemonListQuery } from "../services/pokemonApi";
import { NamedAPIResource } from "../types/api";

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface UsePokemonListResult {
  allPokemon: CachedPokemon[];
  paginationState: PaginationState;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: string | null;
  isLoadingMore: boolean;
  loadMoreData: () => void;
  handleRefresh: () => void;
  handleRetryLoadMore: () => void;
}

export function usePokemonList(): UsePokemonListResult {
  const [allPokemon, setAllPokemon] = useState<CachedPokemon[]>([]);
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 0,
    totalLoaded: 0,
    hasMore: true,
    lastFetchTime: 0,
  });
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [skipQuery, setSkipQuery] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data: pokemonListData,
    error: queryError,
    isFetching,
  } = useGetPokemonListQuery(
    { offset: currentOffset, limit: ITEMS_PER_PAGE },
    { skip: skipQuery }
  );

  // Load cached data on mount
  useEffect(() => {
    const cachedPokemon = loadPokemonList();
    const cachedPagination = loadPaginationState();

    if (cachedPokemon && cachedPagination) {
      const now = Date.now();
      const isCacheValid =
        now - cachedPagination.lastFetchTime < CACHE_DURATION;

      if (isCacheValid) {
        setAllPokemon(cachedPokemon);
        setPaginationState(cachedPagination);
        const restoredOffset = cachedPagination.currentPage * ITEMS_PER_PAGE;
        setCurrentOffset(restoredOffset);
        setIsInitialLoading(false);
        return;
      } else {
        clearPokemonData();
      }
    }

    setCurrentOffset(0);
    setSkipQuery(false);
    setIsInitialLoading(false);
  }, []);

  // Handle query result
  useEffect(() => {
    if (pokemonListData && !isFetching && !queryError) {
      const newPokemon: CachedPokemon[] = pokemonListData.results.map(
        (result: NamedAPIResource) => {
          const urlParts = result.url.split("/");
          const id = parseInt(urlParts[urlParts.length - 2]);
          return { id, name: result.name };
        }
      );

      if (currentOffset === 0) {
        const newPaginationState = {
          currentPage: 0,
          totalLoaded: newPokemon.length,
          hasMore: pokemonListData.next !== null,
          lastFetchTime: Date.now(),
        };
        setAllPokemon(newPokemon);
        setPaginationState(newPaginationState);
        savePokemonList(newPokemon);
        savePaginationState(newPaginationState);
      } else {
        setAllPokemon((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPokemon = newPokemon.filter(
            (p) => !existingIds.has(p.id)
          );
          const updatedList = [...prev, ...uniqueNewPokemon];
          savePokemonList(updatedList);

          const newPaginationState = {
            currentPage: Math.floor(currentOffset / ITEMS_PER_PAGE),
            totalLoaded: prev.length + uniqueNewPokemon.length,
            hasMore: pokemonListData.next !== null,
            lastFetchTime: Date.now(),
          };
          setPaginationState(newPaginationState);
          savePaginationState(newPaginationState);

          return updatedList;
        });
      }

      setSkipQuery(true);
      setError(null);
      setIsLoadingMore(false);
    }
  }, [pokemonListData, isFetching, queryError, currentOffset]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setError("Failed to fetch Pokemon data");
      setSkipQuery(true);
      setIsLoadingMore(false);
    }
  }, [queryError]);

  const loadMoreData = useCallback(() => {
    if (
      !isFetching &&
      !isLoadingMore &&
      paginationState.hasMore &&
      skipQuery &&
      !isInitialLoading
    ) {
      setIsLoadingMore(true);
      const nextOffset = currentOffset + ITEMS_PER_PAGE;
      setCurrentOffset(nextOffset);
      setSkipQuery(false);
    }
  }, [
    currentOffset,
    paginationState.hasMore,
    isFetching,
    skipQuery,
    isInitialLoading,
    isLoadingMore,
  ]);

  const handleRefresh = useCallback(() => {
    clearPokemonData();
    setAllPokemon([]);
    setPaginationState({
      currentPage: 0,
      totalLoaded: 0,
      hasMore: true,
      lastFetchTime: 0,
    });
    setError(null);
    setCurrentOffset(0);
    setSkipQuery(false);
    setIsLoadingMore(false);
  }, []);

  const handleRetryLoadMore = useCallback(() => {
    setError(null);
    loadMoreData();
  }, [loadMoreData]);

  return {
    allPokemon,
    paginationState,
    isInitialLoading,
    isFetching,
    error,
    isLoadingMore,
    loadMoreData,
    handleRefresh,
    handleRetryLoadMore,
  };
}
