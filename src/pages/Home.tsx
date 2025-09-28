import React from "react";
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
import { Header } from "../components/shared/Header";
import { usePokemonList } from "../hooks/usePokemonList";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

const Home: React.FC = () => {
  const {
    allPokemon,
    paginationState,
    isInitialLoading,
    isFetching,
    error,
    isLoadingMore,
    loadMoreData,
    handleRefresh,
    handleRetryLoadMore,
  } = usePokemonList();

  const { targetRef: loadingRef } = useInfiniteScroll<HTMLDivElement>(
    loadMoreData,
    { threshold: 0.1 },
    [allPokemon.length, isFetching, isLoadingMore]
  );

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
