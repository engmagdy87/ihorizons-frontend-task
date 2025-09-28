import React from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Typography,
  Divider,
  Container,
  CircularProgress,
} from "@mui/material";
import { pokemonApi } from "../services/pokemonApi";
import { Header } from "../components/shared/Header";

const PokemonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const pokemonId = parseInt(id || "1");
  const {
    data: pokemon,
    isLoading,
    error,
  } = pokemonApi.useGetPokemonDetailsQuery(pokemonId);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "center", p: 2 }}
          data-testid="loading"
        >
          <CircularProgress size={24} />
        </Box>
      </Box>
    );
  }

  if (error || !pokemon) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" color="error">
          Pokemon not found
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Header title={pokemon.name} />
      <Box
        sx={{
          minHeight: "50vh",
          maxWidth: "60vh",
          display: "grid",
          margin: "0 auto",
        }}
      >
        {/* Pokemon Image */}
        <Box display="flex" justifyContent="center" sx={{ p: 2, flex: 1 }}>
          <Avatar
            src={pokemon.sprites.front_default || ""}
            sx={{ width: 300, height: "auto" }}
            variant="square"
          />
        </Box>

        {/* Information Section */}
        <Box sx={{ p: 2 }}>
          <Divider />

          {/* Name */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Typography
              variant="body2"
              color="black"
              sx={{ fontWeight: "bold", fontSize: "1.2rem", ml: 2 }}
            >
              Name
            </Typography>
            <Typography
              variant="body2"
              color="black"
              sx={{
                fontSize: "1.2rem",
                textTransform: "capitalize",
                mr: 2,
              }}
            >
              {pokemon.name}
            </Typography>
          </Box>
          <Divider />

          {/* Height */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Typography
              variant="body2"
              color="black"
              sx={{ fontWeight: "bold", fontSize: "1.2rem", ml: 2 }}
            >
              Height
            </Typography>
            <Typography
              variant="body2"
              color="black"
              sx={{ fontSize: "1.2rem", mr: 2 }}
            >
              {pokemon.height / 10} m
            </Typography>
          </Box>
          <Divider />

          {/* Weight */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Typography
              variant="body2"
              color="black"
              sx={{ fontWeight: "bold", fontSize: "1.2rem", ml: 2 }}
            >
              Weight
            </Typography>
            <Typography
              variant="body2"
              color="black"
              sx={{ fontSize: "1.2rem", mr: 2 }}
            >
              {pokemon.weight / 10} kg
            </Typography>
          </Box>
          <Divider />

          {/* Types */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Typography
              variant="body2"
              color="black"
              sx={{ fontWeight: "bold", fontSize: "1.2rem", ml: 2 }}
            >
              Types
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                mr: 2,
              }}
            >
              {pokemon.types.map((type, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  color="black"
                  sx={{ fontSize: "1.2rem" }}
                >
                  {type.type.name}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default PokemonDetails;
