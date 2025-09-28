import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import * as localStorage from "../../helpers/localStorage";

// Import Home after mocking
import Home from "../../pages/Home";

// Mock localStorage functions
jest.mock("../../helpers/localStorage", () => ({
  loadPokemonList: jest.fn(),
  savePokemonList: jest.fn(),
  loadPaginationState: jest.fn(),
  savePaginationState: jest.fn(),
  clearPokemonData: jest.fn(),
}));

// Mock PokemonListItem component
jest.mock("../../components/home/PokemonListItem", () => {
  return function MockPokemonListItem({
    id,
    name,
  }: {
    id: number;
    name: string;
  }) {
    return (
      <div data-testid={`pokemon-item-${id}`}>
        <span data-testid="pokemon-name">{name}</span>
        <span data-testid="pokemon-id">{id}</span>
      </div>
    );
  };
});

// Mock Header component
jest.mock("../../components/shared/Header", () => ({
  Header: function MockHeader() {
    return <div data-testid="header">Pokemon Header</div>;
  },
}));

// Mock RTK Query hook with simple implementation
const mockUseGetPokemonListQuery = jest.fn();
jest.mock("../../services/pokemonApi", () => ({
  useGetPokemonListQuery: () => mockUseGetPokemonListQuery(),
  pokemonApi: {
    reducerPath: "pokemonApi",
    reducer: jest.fn((state = {}) => state),
    middleware: [],
  },
}));

// Mock IntersectionObserver completely - make it not interfere with tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
} as any;

const theme = createTheme();

const mockCachedPokemon = [
  { id: 1, name: "bulbasaur" },
  { id: 2, name: "ivysaur" },
  { id: 3, name: "venusaur" },
];

const mockPaginationState = {
  currentPage: 0,
  totalLoaded: 3,
  hasMore: true,
  lastFetchTime: Date.now(),
};

const createMockStore = () => {
  return configureStore({
    reducer: {
      test: (state = {}) => state,
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const mockStore = createMockStore();
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>{component}</ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe("Home Component", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset localStorage mocks to return undefined by default
    (localStorage.loadPokemonList as jest.Mock).mockReturnValue(undefined);
    (localStorage.loadPaginationState as jest.Mock).mockReturnValue(undefined);

    // Default RTK Query mock - no data initially
    mockUseGetPokemonListQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isFetching: false,
    });
  });

  describe("Basic Rendering", () => {
    it("renders header component", async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });
    });

    it("component renders without crashing", () => {
      expect(() => renderWithProviders(<Home />)).not.toThrow();
    });
  });

  describe("Cache Functionality", () => {
    it("loads valid cached data on mount", async () => {
      const validCacheTime = Date.now() - 2 * 60 * 1000; // 2 minutes ago (within 5 min cache)

      (localStorage.loadPokemonList as jest.Mock).mockReturnValue(
        mockCachedPokemon
      );
      (localStorage.loadPaginationState as jest.Mock).mockReturnValue({
        ...mockPaginationState,
        lastFetchTime: validCacheTime,
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId("pokemon-item-1")).toBeInTheDocument();
      });

      expect(screen.getByText("bulbasaur")).toBeInTheDocument();
      expect(screen.getByText("ivysaur")).toBeInTheDocument();
      expect(screen.getByText("venusaur")).toBeInTheDocument();
    });

    it("clears expired cache and fetches fresh data", async () => {
      const expiredCacheTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago (expired)

      (localStorage.loadPokemonList as jest.Mock).mockReturnValue(
        mockCachedPokemon
      );
      (localStorage.loadPaginationState as jest.Mock).mockReturnValue({
        ...mockPaginationState,
        lastFetchTime: expiredCacheTime,
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(localStorage.clearPokemonData).toHaveBeenCalled();
      });
    });
  });

  describe("Data Fetching", () => {
    it("displays Pokemon data when available", async () => {
      const mockPokemonData = {
        count: 1302,
        next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
        previous: null,
        results: [
          { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
          { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
          { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
        ],
      };

      mockUseGetPokemonListQuery.mockReturnValue({
        data: mockPokemonData,
        error: undefined,
        isFetching: false,
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId("pokemon-item-1")).toBeInTheDocument();
      });

      expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    });

    it("handles API errors gracefully", async () => {
      mockUseGetPokemonListQuery.mockReturnValue({
        data: undefined,
        error: { message: "Network error" },
        isFetching: false,
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to fetch Pokemon data")
        ).toBeInTheDocument();
      });
    });

    it("shows loading indicator when fetching data", async () => {
      mockUseGetPokemonListQuery.mockReturnValue({
        data: undefined,
        error: undefined,
        isFetching: true,
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
      });
    });
  });

  describe("End of List Handling", () => {
    it("shows end of list message when no more data available", async () => {
      const endPaginationState = {
        ...mockPaginationState,
        hasMore: false,
      };

      (localStorage.loadPokemonList as jest.Mock).mockReturnValue(
        mockCachedPokemon
      );
      (localStorage.loadPaginationState as jest.Mock).mockReturnValue(
        endPaginationState
      );

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText("You've reached the end of the Pokemon list!")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Data Persistence", () => {
    it("saves data to localStorage when processing new data", async () => {
      const mockPokemonData = {
        count: 1302,
        next: "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
        previous: null,
        results: [
          { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
        ],
      };

      mockUseGetPokemonListQuery.mockReturnValue({
        data: mockPokemonData,
        error: undefined,
        isFetching: false,
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(localStorage.savePokemonList).toHaveBeenCalled();
      });

      expect(localStorage.savePaginationState).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty Pokemon list", async () => {
      const emptyData = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      mockUseGetPokemonListQuery.mockReturnValue({
        data: emptyData,
        error: undefined,
        isFetching: false,
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });

      // Should not show any Pokemon items
      expect(screen.queryByTestId("pokemon-item-1")).not.toBeInTheDocument();
    });

    it("renders component without crashing when localStorage is unavailable", () => {
      (localStorage.loadPokemonList as jest.Mock).mockReturnValue(undefined);
      (localStorage.loadPaginationState as jest.Mock).mockReturnValue(
        undefined
      );

      expect(() => renderWithProviders(<Home />)).not.toThrow();
    });
  });

  describe("Component Lifecycle", () => {
    it("handles component state updates correctly", async () => {
      const { rerender } = renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      });

      // Rerender should not cause issues
      rerender(
        <Provider store={createMockStore()}>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <Home />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("component unmounts without errors", () => {
      const { unmount } = renderWithProviders(<Home />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Local Storage Integration", () => {
    it("calls localStorage functions appropriately", () => {
      renderWithProviders(<Home />);

      // Should attempt to load cached data on mount
      expect(localStorage.loadPokemonList).toHaveBeenCalled();
      expect(localStorage.loadPaginationState).toHaveBeenCalled();
    });
  });
});
