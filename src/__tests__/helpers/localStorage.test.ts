import {
  loadPokemonList,
  savePokemonList,
  loadPaginationState,
  savePaginationState,
  clearPokemonData,
  loadState,
  saveState,
  CachedPokemon,
  PaginationState,
} from "../../helpers/localStorage";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock console methods
const originalConsoleWarn = console.warn;

describe("localStorage Helpers", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Replace localStorage with our mock
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Mock console.warn
    console.warn = jest.fn();
  });

  afterEach(() => {
    // Restore console.warn
    console.warn = originalConsoleWarn;
  });

  describe("loadPokemonList", () => {
    it("returns parsed Pokemon list when data exists", () => {
      const mockPokemonList: CachedPokemon[] = [
        { id: 1, name: "bulbasaur" },
        { id: 2, name: "ivysaur" },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPokemonList));

      const result = loadPokemonList();

      expect(localStorageMock.getItem).toHaveBeenCalledWith("pokemons");
      expect(result).toEqual(mockPokemonList);
    });

    it("returns undefined when no data exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadPokemonList();

      expect(localStorageMock.getItem).toHaveBeenCalledWith("pokemons");
      expect(result).toBeUndefined();
    });

    it("returns undefined when JSON parsing fails", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      const result = loadPokemonList();

      expect(result).toBeUndefined();
    });

    it("returns undefined when localStorage throws an error", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const result = loadPokemonList();

      expect(result).toBeUndefined();
    });

    it("handles empty string from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("");

      const result = loadPokemonList();

      expect(result).toBeUndefined();
    });
  });

  describe("savePokemonList", () => {
    it("saves Pokemon list to localStorage", () => {
      const mockPokemonList: CachedPokemon[] = [
        { id: 1, name: "bulbasaur" },
        { id: 25, name: "pikachu" },
      ];

      savePokemonList(mockPokemonList);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemons",
        JSON.stringify(mockPokemonList)
      );
    });

    it("saves empty array to localStorage", () => {
      const emptyList: CachedPokemon[] = [];

      savePokemonList(emptyList);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemons",
        JSON.stringify(emptyList)
      );
    });

    it("logs warning when localStorage.setItem throws an error", () => {
      const mockPokemonList: CachedPokemon[] = [{ id: 1, name: "bulbasaur" }];
      const error = new Error("Storage quota exceeded");

      localStorageMock.setItem.mockImplementation(() => {
        throw error;
      });

      savePokemonList(mockPokemonList);

      expect(console.warn).toHaveBeenCalledWith(
        "Failed to save Pokemon list to localStorage:",
        error
      );
    });

    it("handles very large Pokemon lists", () => {
      const largePokemonList: CachedPokemon[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: i + 1,
          name: `pokemon-${i + 1}`,
        })
      );

      savePokemonList(largePokemonList);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemons",
        JSON.stringify(largePokemonList)
      );
    });
  });

  describe("loadPaginationState", () => {
    it("returns parsed pagination state when data exists", () => {
      const mockPaginationState: PaginationState = {
        currentPage: 2,
        totalLoaded: 40,
        hasMore: true,
        lastFetchTime: Date.now(),
      };

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(mockPaginationState)
      );

      const result = loadPaginationState();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "pokemon_pagination"
      );
      expect(result).toEqual(mockPaginationState);
    });

    it("returns undefined when no data exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadPaginationState();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "pokemon_pagination"
      );
      expect(result).toBeUndefined();
    });

    it("returns undefined when JSON parsing fails", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      const result = loadPaginationState();

      expect(result).toBeUndefined();
    });

    it("returns undefined when localStorage throws an error", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const result = loadPaginationState();

      expect(result).toBeUndefined();
    });

    it("handles pagination state with hasMore false", () => {
      const mockPaginationState: PaginationState = {
        currentPage: 5,
        totalLoaded: 100,
        hasMore: false,
        lastFetchTime: Date.now(),
      };

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(mockPaginationState)
      );

      const result = loadPaginationState();

      expect(result).toEqual(mockPaginationState);
    });
  });

  describe("savePaginationState", () => {
    it("saves pagination state to localStorage", () => {
      const mockPaginationState: PaginationState = {
        currentPage: 3,
        totalLoaded: 60,
        hasMore: true,
        lastFetchTime: 1640995200000,
      };

      savePaginationState(mockPaginationState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemon_pagination",
        JSON.stringify(mockPaginationState)
      );
    });

    it("logs warning when localStorage.setItem throws an error", () => {
      const mockPaginationState: PaginationState = {
        currentPage: 1,
        totalLoaded: 20,
        hasMore: true,
        lastFetchTime: Date.now(),
      };
      const error = new Error("Storage quota exceeded");

      localStorageMock.setItem.mockImplementation(() => {
        throw error;
      });

      savePaginationState(mockPaginationState);

      expect(console.warn).toHaveBeenCalledWith(
        "Failed to save pagination state to localStorage:",
        error
      );
    });

    it("saves pagination state with edge case values", () => {
      const edgeCasePaginationState: PaginationState = {
        currentPage: 0,
        totalLoaded: 0,
        hasMore: false,
        lastFetchTime: 0,
      };

      savePaginationState(edgeCasePaginationState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemon_pagination",
        JSON.stringify(edgeCasePaginationState)
      );
    });
  });

  describe("clearPokemonData", () => {
    it("removes both Pokemon list and pagination state from localStorage", () => {
      clearPokemonData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("pokemons");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "pokemon_pagination"
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });

    it("logs warning when localStorage.removeItem throws an error", () => {
      const error = new Error("localStorage error");

      localStorageMock.removeItem.mockImplementation(() => {
        throw error;
      });

      clearPokemonData();

      expect(console.warn).toHaveBeenCalledWith(
        "Failed to clear Pokemon data from localStorage:",
        error
      );
    });

    it("handles partial failure when one removeItem succeeds and another fails", () => {
      localStorageMock.removeItem
        .mockImplementationOnce(() => {}) // First call succeeds
        .mockImplementationOnce(() => {
          throw new Error("Failed to remove pagination");
        }); // Second call fails

      clearPokemonData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("pokemons");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "pokemon_pagination"
      );
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to clear Pokemon data from localStorage:",
        expect.any(Error)
      );
    });
  });

  describe("Legacy Functions", () => {
    describe("loadState (deprecated)", () => {
      it("is an alias for loadPokemonList", () => {
        const mockPokemonList: CachedPokemon[] = [{ id: 1, name: "bulbasaur" }];

        localStorageMock.getItem.mockReturnValue(
          JSON.stringify(mockPokemonList)
        );

        const result = loadState();

        expect(localStorageMock.getItem).toHaveBeenCalledWith("pokemons");
        expect(result).toEqual(mockPokemonList);
      });

      it("behaves identically to loadPokemonList for error cases", () => {
        localStorageMock.getItem.mockReturnValue(null);

        const result = loadState();

        expect(result).toBeUndefined();
      });
    });

    describe("saveState (deprecated)", () => {
      it("saves data and shows deprecation warning", () => {
        const mockData = [{ id: 1, name: "bulbasaur" }];

        saveState(mockData);

        expect(console.warn).toHaveBeenCalledWith(
          "saveState is deprecated, use savePokemonList instead"
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "pokemons",
          JSON.stringify(mockData)
        );
      });

      it("silently catches errors without logging", () => {
        const mockData = [{ id: 1, name: "bulbasaur" }];
        const error = new Error("Storage error");

        localStorageMock.setItem.mockImplementation(() => {
          throw error;
        });

        saveState(mockData);

        expect(console.warn).toHaveBeenCalledWith(
          "saveState is deprecated, use savePokemonList instead"
        );
        // Should not log the storage error (silent catch)
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      it("handles various data types", () => {
        const mixedData = [
          { id: 1, name: "bulbasaur", extra: { type: "grass" } },
          { id: 2, name: "ivysaur", active: true },
        ];

        saveState(mixedData);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "pokemons",
          JSON.stringify(mixedData)
        );
      });
    });
  });

  describe("Integration Tests", () => {
    it("can save and load Pokemon list consistently", () => {
      const mockPokemonList: CachedPokemon[] = [
        { id: 1, name: "bulbasaur" },
        { id: 25, name: "pikachu" },
      ];

      // Save data
      savePokemonList(mockPokemonList);

      // Simulate localStorage returning the saved data
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      localStorageMock.getItem.mockReturnValue(savedData);

      // Load data
      const result = loadPokemonList();

      expect(result).toEqual(mockPokemonList);
    });

    it("can save and load pagination state consistently", () => {
      const mockPaginationState: PaginationState = {
        currentPage: 2,
        totalLoaded: 40,
        hasMore: true,
        lastFetchTime: 1640995200000,
      };

      // Save data
      savePaginationState(mockPaginationState);

      // Simulate localStorage returning the saved data
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      localStorageMock.getItem.mockReturnValue(savedData);

      // Load data
      const result = loadPaginationState();

      expect(result).toEqual(mockPaginationState);
    });

    it("handles complete workflow: save, load, clear", () => {
      const mockPokemonList: CachedPokemon[] = [{ id: 1, name: "bulbasaur" }];
      const mockPaginationState: PaginationState = {
        currentPage: 1,
        totalLoaded: 20,
        hasMore: true,
        lastFetchTime: Date.now(),
      };

      // Save both
      savePokemonList(mockPokemonList);
      savePaginationState(mockPaginationState);

      // Verify saves
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);

      // Clear all
      clearPokemonData();

      // Verify clears
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("pokemons");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "pokemon_pagination"
      );
    });
  });

  describe("Type Safety", () => {
    it("enforces CachedPokemon interface for Pokemon list", () => {
      const validPokemon: CachedPokemon[] = [
        { id: 1, name: "bulbasaur" },
        { id: 2, name: "ivysaur" },
      ];

      // This should compile without TypeScript errors
      savePokemonList(validPokemon);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemons",
        JSON.stringify(validPokemon)
      );
    });

    it("enforces PaginationState interface for pagination state", () => {
      const validPaginationState: PaginationState = {
        currentPage: 1,
        totalLoaded: 20,
        hasMore: true,
        lastFetchTime: Date.now(),
      };

      // This should compile without TypeScript errors
      savePaginationState(validPaginationState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemon_pagination",
        JSON.stringify(validPaginationState)
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles null values gracefully", () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(loadPokemonList()).toBeUndefined();
      expect(loadPaginationState()).toBeUndefined();
    });

    it("handles undefined localStorage", () => {
      // Simulate environment without localStorage
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      expect(() => loadPokemonList()).not.toThrow();
      expect(() => savePokemonList([])).not.toThrow();
      expect(() => clearPokemonData()).not.toThrow();
    });

    it("handles circular reference in objects gracefully", () => {
      const circularObj: any = { id: 1, name: "test" };
      circularObj.self = circularObj;

      // This should not crash, but will be caught by error handling
      expect(() => savePokemonList([circularObj])).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });

    it("handles very large timestamp values", () => {
      const futurePaginationState: PaginationState = {
        currentPage: 1,
        totalLoaded: 20,
        hasMore: true,
        lastFetchTime: Number.MAX_SAFE_INTEGER,
      };

      savePaginationState(futurePaginationState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "pokemon_pagination",
        JSON.stringify(futurePaginationState)
      );
    });
  });
});
