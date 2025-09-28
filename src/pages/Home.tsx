import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import {
  Typography,
  Box,
  Skeleton,
  Alert,
  List,
  Divider,
  Container,
  CircularProgress,
} from "@mui/material";
import PokemonListItem from "../components/home/PokemonListItem";
import {
  loadPokemonList,
  savePokemonList,
  loadPaginationState,
  savePaginationState,
  clearPokemonData,
  CachedPokemon,
  PaginationState,
} from "../helpers/localStorage";
import { Header } from "../components/shared/Header";
import { useGetPokemonListQuery } from "../services/pokemonApi";
import { NamedAPIResource } from "../types/api";

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Home: React.FC = () => {
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const loadMoreDataRef = useRef<() => void>(() => {});

  // Use RTK Query for fetching
  const {
    data: pokemonListData,
    error: queryError,
    isFetching,
  } = useGetPokemonListQuery(
    {
      offset: currentOffset,
      limit: ITEMS_PER_PAGE,
    },
    {
      skip: skipQuery,
    }
  );

  // Load cached data on component mount
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
        // Restore currentOffset based on cached pagination state
        const restoredOffset = cachedPagination.currentPage * ITEMS_PER_PAGE;

        setCurrentOffset(restoredOffset);
        setIsInitialLoading(false);
        return;
      } else {
        // Cache expired, clear it
        clearPokemonData();
      }
    }

    // No valid cache, start fresh - trigger first query
    setCurrentOffset(0);
    setSkipQuery(false);
    setIsInitialLoading(false);
  }, []);

  // Handle query result
  useEffect(() => {
    if (pokemonListData && !isFetching && !queryError) {
      // Transform API response to cached format
      const newPokemon: CachedPokemon[] = pokemonListData.results.map(
        (result: NamedAPIResource) => {
          const urlParts = result.url.split("/");
          const id = parseInt(urlParts[urlParts.length - 2]);
          return { id, name: result.name };
        }
      );

      if (currentOffset === 0) {
        // Initial load
        setAllPokemon(newPokemon);
        const newPaginationState = {
          currentPage: 0,
          totalLoaded: newPokemon.length,
          hasMore: pokemonListData.next !== null,
          lastFetchTime: Date.now(),
        };
        setPaginationState(newPaginationState);
        savePokemonList(newPokemon);
        savePaginationState(newPaginationState);
      } else {
        // Load more
        setAllPokemon((prev) => {
          // Filter out duplicates by ID to prevent duplicate keys
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPokemon = newPokemon.filter(
            (p) => !existingIds.has(p.id)
          );
          const updatedList = [...prev, ...uniqueNewPokemon];
          savePokemonList(updatedList);
          return updatedList;
        });

        // Update pagination state separately to avoid causing re-renders inside setAllPokemon
        const newPaginationState = {
          currentPage: Math.floor(currentOffset / ITEMS_PER_PAGE),
          totalLoaded: allPokemon.length + newPokemon.length,
          hasMore: pokemonListData.next !== null,
          lastFetchTime: Date.now(),
        };
        setPaginationState(newPaginationState);
        savePaginationState(newPaginationState);
      }

      // Skip subsequent queries until manually triggered
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

  // Load more data function
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

  // Update ref when loadMoreData changes
  useEffect(() => {
    loadMoreDataRef.current = loadMoreData;
  }, [loadMoreData]);

  // Intersection Observer for infinite scroll - using useLayoutEffect to ensure DOM is ready
  useLayoutEffect(() => {
    if (!loadingRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Use ref to avoid dependency issues
          loadMoreDataRef.current?.();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [allPokemon.length]); // Re-setup when list changes to ensure element exists

  // Handle refresh - clear cache and reload
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

  // Handle retry for loading more
  const handleRetryLoadMore = useCallback(() => {
    setError(null);
    loadMoreData();
  }, [loadMoreData]);

  if (isInitialLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Box sx={{ width: "100%" }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mb: 2 }}
            >
              <Skeleton
                variant="circular"
                width={56}
                height={56}
                sx={{ mr: 2 }}
              />
              <Skeleton variant="text" width="60%" height={40} />
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  if (error && allPokemon.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Alert
          severity="error"
          action={
            <button
              onClick={handleRefresh}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Header />
      <Container maxWidth="sm" sx={{ mt: 0, p: 0 }}>
        <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
          <List>
            {allPokemon.map(({ id, name }, index) => (
              <React.Fragment key={id}>
                <PokemonListItem id={id} name={name} />
                {index < allPokemon.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {/* Loading indicator for infinite scroll */}
          {isFetching && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Intersection observer target */}
          <div ref={loadingRef} style={{ height: "20px" }} />

          {/* Error state for loading more */}
          {error && allPokemon.length > 0 && (
            <Alert
              severity="error"
              sx={{ m: 2 }}
              action={
                <button
                  onClick={handleRetryLoadMore}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              }
            >
              Failed to load more Pokemon
            </Alert>
          )}

          {/* End of list indicator */}
          {!paginationState.hasMore && allPokemon.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                p: 2,
                color: "text.secondary",
                display: "block",
                textAlign: "center",
              }}
            >
              You've reached the end of the Pokemon list!
            </Typography>
          )}
        </Box>
      </Container>
    </Container>
  );
};

export default Home;
