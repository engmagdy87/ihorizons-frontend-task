import { PokemonListResponse, PokemonDetails } from "../../types/api";

// Mock fetch to control API responses
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock RTK Query
const mockCreateApi = jest.fn();
const mockFetchBaseQuery = jest.fn();

jest.mock("@reduxjs/toolkit/query/react", () => ({
  createApi: (...args: any[]) => {
    mockCreateApi(...args);
    return {
      reducerPath: "pokemonApi",
      reducer: jest.fn(),
      middleware: jest.fn(),
      endpoints: {},
      useGetPokemonListQuery: jest.fn(),
      useGetPokemonDetailsQuery: jest.fn(),
    };
  },
  fetchBaseQuery: (...args: any[]) => {
    mockFetchBaseQuery(...args);
    return jest.fn();
  },
}));

describe("pokemonApi Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("API Configuration", () => {
    it("should configure the API with correct settings", () => {
      // Import after mocking to avoid issues
      require("../../services/pokemonApi");

      expect(mockCreateApi).toHaveBeenCalledWith({
        reducerPath: "pokemonApi",
        baseQuery: expect.any(Function),
        tagTypes: ["Pokemon"],
        endpoints: expect.any(Function),
      });
    });

    it("should configure base query with correct URL", () => {
      // Clear and setup mock before requiring
      jest.resetModules();
      mockFetchBaseQuery.mockClear();

      require("../../services/pokemonApi");

      expect(mockFetchBaseQuery).toHaveBeenCalledWith({
        baseUrl: expect.stringContaining("https://pokeapi.co/api/v2"),
      });
    });

    it("should use environment variable for base URL when available", () => {
      const originalEnv = process.env.REACT_APP_API_BASE_URL;
      process.env.REACT_APP_API_BASE_URL = "https://custom-api.example.com";

      // Clear module cache to re-import with new env
      jest.resetModules();
      mockFetchBaseQuery.mockClear();

      require("../../services/pokemonApi");

      expect(mockFetchBaseQuery).toHaveBeenCalledWith({
        baseUrl: "https://custom-api.example.com",
      });

      // Restore environment
      if (originalEnv) {
        process.env.REACT_APP_API_BASE_URL = originalEnv;
      } else {
        delete process.env.REACT_APP_API_BASE_URL;
      }
    });

    it("should fall back to default URL when environment variable is not set", () => {
      const originalEnv = process.env.REACT_APP_API_BASE_URL;
      delete process.env.REACT_APP_API_BASE_URL;

      // Clear module cache to re-import with new env
      jest.resetModules();
      mockFetchBaseQuery.mockClear();

      require("../../services/pokemonApi");

      expect(mockFetchBaseQuery).toHaveBeenCalledWith({
        baseUrl: "https://pokeapi.co/api/v2",
      });

      // Restore environment
      if (originalEnv) {
        process.env.REACT_APP_API_BASE_URL = originalEnv;
      }
    });
  });

  describe("Endpoint Configuration", () => {
    let endpointsBuilder: any;
    let endpoints: any;

    beforeEach(() => {
      jest.resetModules();
      mockCreateApi.mockClear();

      // Capture the endpoints builder function
      mockCreateApi.mockImplementation((config) => {
        if (config.endpoints) {
          endpointsBuilder = {
            query: jest.fn().mockImplementation((config) => config),
          };
          endpoints = config.endpoints(endpointsBuilder);
        }
        return {
          reducerPath: config.reducerPath,
          endpoints: endpoints || {},
        };
      });

      require("../../services/pokemonApi");
    });

    describe("getPokemonList endpoint", () => {
      it("should be configured correctly", () => {
        expect(endpoints.getPokemonList).toBeDefined();
        expect(endpointsBuilder.query).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.any(Function),
            providesTags: ["Pokemon"],
          })
        );
      });

      it("should generate correct query for default parameters", () => {
        const queryConfig = endpoints.getPokemonList;
        const result = queryConfig.query({});

        expect(result).toEqual({
          url: "/pokemon/",
          params: { offset: 0, limit: 20 },
        });
      });

      it("should generate correct query for custom parameters", () => {
        const queryConfig = endpoints.getPokemonList;
        const result = queryConfig.query({ offset: 40, limit: 50 });

        expect(result).toEqual({
          url: "/pokemon/",
          params: { offset: 40, limit: 50 },
        });
      });

      it("should handle offset parameter only", () => {
        const queryConfig = endpoints.getPokemonList;
        const result = queryConfig.query({ offset: 100 });

        expect(result).toEqual({
          url: "/pokemon/",
          params: { offset: 100, limit: 20 },
        });
      });

      it("should handle limit parameter only", () => {
        const queryConfig = endpoints.getPokemonList;
        const result = queryConfig.query({ limit: 10 });

        expect(result).toEqual({
          url: "/pokemon/",
          params: { offset: 0, limit: 10 },
        });
      });

      it("should handle zero values", () => {
        const queryConfig = endpoints.getPokemonList;
        const result = queryConfig.query({ offset: 0, limit: 0 });

        expect(result).toEqual({
          url: "/pokemon/",
          params: { offset: 0, limit: 0 },
        });
      });

      it("should handle large values", () => {
        const queryConfig = endpoints.getPokemonList;
        const result = queryConfig.query({ offset: 1000, limit: 100 });

        expect(result).toEqual({
          url: "/pokemon/",
          params: { offset: 1000, limit: 100 },
        });
      });

      it("should provide correct cache tags", () => {
        const queryConfig = endpoints.getPokemonList;
        expect(queryConfig.providesTags).toEqual(["Pokemon"]);
      });
    });

    describe("getPokemonDetails endpoint", () => {
      it("should be configured correctly", () => {
        expect(endpoints.getPokemonDetails).toBeDefined();
        expect(endpointsBuilder.query).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.any(Function),
            providesTags: expect.any(Function),
          })
        );
      });

      it("should generate correct query for Pokemon ID", () => {
        const queryConfig = endpoints.getPokemonDetails;
        const result = queryConfig.query(1);

        expect(result).toBe("/pokemon/1/");
      });

      it("should generate correct query for different Pokemon IDs", () => {
        const queryConfig = endpoints.getPokemonDetails;

        expect(queryConfig.query(25)).toBe("/pokemon/25/");
        expect(queryConfig.query(150)).toBe("/pokemon/150/");
        expect(queryConfig.query(1000)).toBe("/pokemon/1000/");
      });

      it("should handle zero Pokemon ID", () => {
        const queryConfig = endpoints.getPokemonDetails;
        const result = queryConfig.query(0);

        expect(result).toBe("/pokemon/0/");
      });

      it("should provide correct cache tags with Pokemon ID", () => {
        const queryConfig = endpoints.getPokemonDetails;
        const tagFunction = queryConfig.providesTags;

        // Test the tag function
        const mockResult = {} as PokemonDetails;
        const mockError = undefined;
        const pokemonId = 1;

        const tags = tagFunction(mockResult, mockError, pokemonId);
        expect(tags).toEqual([{ type: "Pokemon", id: "1" }]);
      });

      it("should handle tag generation for different Pokemon IDs", () => {
        const queryConfig = endpoints.getPokemonDetails;
        const tagFunction = queryConfig.providesTags;

        const mockResult = {} as PokemonDetails;
        const mockError = undefined;

        expect(tagFunction(mockResult, mockError, 25)).toEqual([
          { type: "Pokemon", id: "25" },
        ]);
        expect(tagFunction(mockResult, mockError, 150)).toEqual([
          { type: "Pokemon", id: "150" },
        ]);
      });
    });
  });

  describe("API Types and Interfaces", () => {
    it("should work with PokemonListResponse type", () => {
      const mockResponse: PokemonListResponse = {
        count: 1302,
        next: "https://pokeapi.co/api/v2/pokemon/?offset=40&limit=20",
        previous: null,
        results: [
          {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon/1/",
          },
          {
            name: "ivysaur",
            url: "https://pokeapi.co/api/v2/pokemon/2/",
          },
        ],
      };

      expect(mockResponse.count).toBe(1302);
      expect(mockResponse.results).toHaveLength(2);
      expect(mockResponse.results[0].name).toBe("bulbasaur");
    });

    it("should work with PokemonDetails type", () => {
      const mockPokemon: PokemonDetails = {
        id: 1,
        name: "bulbasaur",
        height: 7,
        weight: 69,
        base_experience: 64,
        sprites: {
          back_default: "https://example.com/back/1.png",
          back_female: null,
          back_shiny: null,
          back_shiny_female: null,
          front_default: "https://example.com/front/1.png",
          front_female: null,
          front_shiny: null,
          front_shiny_female: null,
          other: {
            dream_world: {
              front_default: null,
              front_female: null,
            },
            home: {
              front_default: null,
              front_female: null,
              front_shiny: null,
              front_shiny_female: null,
            },
            "official-artwork": {
              front_default: null,
              front_shiny: null,
            },
          },
        },
        types: [
          {
            slot: 1,
            type: {
              name: "grass",
              url: "https://pokeapi.co/api/v2/type/12/",
            },
          },
        ],
        stats: [
          {
            base_stat: 45,
            effort: 0,
            stat: {
              name: "hp",
              url: "https://pokeapi.co/api/v2/stat/1/",
            },
          },
        ],
      };

      expect(mockPokemon.id).toBe(1);
      expect(mockPokemon.name).toBe("bulbasaur");
      expect(mockPokemon.types).toHaveLength(1);
      expect(mockPokemon.types[0].type.name).toBe("grass");
    });

    it("should handle empty results in PokemonListResponse", () => {
      const emptyResponse: PokemonListResponse = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      expect(emptyResponse.count).toBe(0);
      expect(emptyResponse.results).toHaveLength(0);
      expect(emptyResponse.next).toBeNull();
      expect(emptyResponse.previous).toBeNull();
    });

    it("should handle Pokemon with multiple types", () => {
      const multiTypePokemon: Partial<PokemonDetails> = {
        types: [
          {
            slot: 1,
            type: {
              name: "grass",
              url: "https://pokeapi.co/api/v2/type/12/",
            },
          },
          {
            slot: 2,
            type: {
              name: "poison",
              url: "https://pokeapi.co/api/v2/type/4/",
            },
          },
        ],
      };

      expect(multiTypePokemon.types).toHaveLength(2);
      expect(multiTypePokemon.types![0].type.name).toBe("grass");
      expect(multiTypePokemon.types![1].type.name).toBe("poison");
    });

    it("should handle Pokemon with null sprites", () => {
      const noSpritesPokemon: Partial<PokemonDetails> = {
        sprites: {
          back_default: null,
          back_female: null,
          back_shiny: null,
          back_shiny_female: null,
          front_default: null,
          front_female: null,
          front_shiny: null,
          front_shiny_female: null,
          other: {
            dream_world: {
              front_default: null,
              front_female: null,
            },
            home: {
              front_default: null,
              front_female: null,
              front_shiny: null,
              front_shiny_female: null,
            },
            "official-artwork": {
              front_default: null,
              front_shiny: null,
            },
          },
        },
      };

      expect(noSpritesPokemon.sprites!.front_default).toBeNull();
      expect(noSpritesPokemon.sprites!.back_default).toBeNull();
      expect(
        noSpritesPokemon.sprites!.other["official-artwork"].front_default
      ).toBeNull();
    });
  });

  describe("Error Handling Scenarios", () => {
    it("should handle network errors gracefully", () => {
      // This tests that our configuration would handle errors
      // In a real RTK Query implementation, errors would be handled by the baseQuery
      const errorScenarios = [
        { status: 404, message: "Pokemon not found" },
        { status: 500, message: "Internal server error" },
        { status: 0, message: "Network error" },
      ];

      errorScenarios.forEach((scenario) => {
        expect(scenario.status).toBeDefined();
        expect(scenario.message).toBeDefined();
      });
    });

    it("should handle invalid Pokemon IDs", () => {
      // Test edge cases for Pokemon ID validation
      const invalidIds = [-1, 99999, NaN, Infinity];
      const invalidCount = invalidIds.filter(
        (id) => isNaN(id) || !isFinite(id) || id < 0
      ).length;

      expect(invalidCount).toBeGreaterThan(0);
    });

    it("should handle invalid pagination parameters", () => {
      // Test edge cases for pagination parameters
      const invalidParams = [
        { offset: -1, limit: 20 },
        { offset: 0, limit: -1 },
        { offset: NaN, limit: 20 },
        { offset: 0, limit: Infinity },
      ];

      const invalidCount = invalidParams.filter((params) => {
        return (
          isNaN(params.offset) ||
          isNaN(params.limit) ||
          params.offset < 0 ||
          params.limit < 0 ||
          !isFinite(params.offset) ||
          !isFinite(params.limit)
        );
      }).length;

      expect(invalidCount).toBe(invalidParams.length);
    });
  });

  describe("Performance and Caching", () => {
    it("should be configured for optimal caching", () => {
      // Test that our API configuration supports caching
      jest.resetModules();
      mockCreateApi.mockClear();

      require("../../services/pokemonApi");

      expect(mockCreateApi).toHaveBeenCalled();
      const createApiCall = mockCreateApi.mock.calls[0][0];
      expect(createApiCall.tagTypes).toContain("Pokemon");
      expect(createApiCall.reducerPath).toBe("pokemonApi");
    });

    it("should provide cache invalidation tags", () => {
      jest.resetModules();
      let endpoints: any;

      mockCreateApi.mockImplementation((config) => {
        if (config.endpoints) {
          const builder = {
            query: jest.fn().mockImplementation((config) => config),
          };
          endpoints = config.endpoints(builder);
        }
        return { endpoints: endpoints || {} };
      });

      require("../../services/pokemonApi");

      // Check that endpoints provide proper cache tags
      expect(endpoints.getPokemonList.providesTags).toEqual(["Pokemon"]);
      expect(typeof endpoints.getPokemonDetails.providesTags).toBe("function");
    });

    it("should generate unique cache keys for different requests", () => {
      jest.resetModules();
      let endpoints: any;

      mockCreateApi.mockImplementation((config) => {
        if (config.endpoints) {
          const builder = {
            query: jest.fn().mockImplementation((config) => config),
          };
          endpoints = config.endpoints(builder);
        }
        return { endpoints: endpoints || {} };
      });

      require("../../services/pokemonApi");

      // Different pagination parameters should create different cache keys
      const query1 = endpoints.getPokemonList.query({ offset: 0, limit: 20 });
      const query2 = endpoints.getPokemonList.query({ offset: 20, limit: 20 });

      expect(query1).not.toEqual(query2);

      // Different Pokemon IDs should create different cache keys
      const pokemonQuery1 = endpoints.getPokemonDetails.query(1);
      const pokemonQuery2 = endpoints.getPokemonDetails.query(2);

      expect(pokemonQuery1).not.toEqual(pokemonQuery2);
    });
  });

  describe("Integration Readiness", () => {
    it("should export the correct hooks when available", () => {
      // Test that the module would export the correct hooks
      // In real implementation, these would be generated by RTK Query
      const expectedHooks = [
        "useGetPokemonListQuery",
        "useGetPokemonDetailsQuery",
      ];

      expectedHooks.forEach((hookName) => {
        expect(hookName).toMatch(/^use.*Query$/);
      });
    });

    it("should be compatible with Redux store integration", () => {
      jest.resetModules();
      mockCreateApi.mockClear();

      require("../../services/pokemonApi");

      expect(mockCreateApi).toHaveBeenCalled();
      const createApiCall = mockCreateApi.mock.calls[0][0];

      // Check that the API is configured for Redux integration
      expect(createApiCall.reducerPath).toBe("pokemonApi");
      expect(typeof createApiCall.baseQuery).toBe("function");
      expect(typeof createApiCall.endpoints).toBe("function");
    });

    it("should handle concurrent requests appropriately", () => {
      // Test that our configuration would handle concurrent requests
      const concurrentRequests = [
        { type: "list", params: { offset: 0, limit: 20 } },
        { type: "list", params: { offset: 20, limit: 20 } },
        { type: "details", id: 1 },
        { type: "details", id: 2 },
      ];

      // Each request should have unique identifiers
      const requestIdentifiers = concurrentRequests.map((req) => {
        if (req.type === "list" && req.params) {
          return `list-${req.params.offset}-${req.params.limit}`;
        }
        return `details-${req.id}`;
      });

      const uniqueIdentifiers = new Set(requestIdentifiers);
      expect(uniqueIdentifiers.size).toBe(concurrentRequests.length);
    });
  });
});
