import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PokemonListResponse, PokemonDetails } from "../types/api";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://pokeapi.co/api/v2";

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ["Pokemon"],
  endpoints: (builder) => ({
    getPokemonList: builder.query<
      PokemonListResponse,
      { offset?: number; limit?: number }
    >({
      query: ({ offset = 0, limit = 20 } = {}) => ({
        url: "/pokemon/",
        params: { offset, limit },
      }),
      providesTags: ["Pokemon"],
    }),
    getPokemonDetails: builder.query<PokemonDetails, number>({
      query: (id) => `/pokemon/${id}/`,
      providesTags: (result, error, id) => [
        { type: "Pokemon", id: id.toString() },
      ],
    }),
  }),
});

export const { useGetPokemonListQuery, useGetPokemonDetailsQuery } = pokemonApi;
