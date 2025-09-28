import { renderHook, act, waitFor } from "@testing-library/react";
import * as localStorage from "../../helpers/localStorage";
import { usePokemonList } from "../../hooks/usePokemonList";

// Mock localStorage helpers
jest.mock("../../helpers/localStorage", () => ({
  loadPokemonList: jest.fn(),
  savePokemonList: jest.fn(),
  loadPaginationState: jest.fn(),
  savePaginationState: jest.fn(),
  clearPokemonData: jest.fn(),
}));

// Mock RTK Query hook with dynamic return
const mockUseGetPokemonListQuery = jest.fn();
let currentQueryResult: { data: any; error: any; isFetching: boolean } = {
  data: undefined,
  error: undefined,
  isFetching: false,
};
jest.mock("../../services/pokemonApi", () => ({
  useGetPokemonListQuery: () => mockUseGetPokemonListQuery(),
}));

describe("usePokemonList", () => {
  const fixedNow = 1_700_000_000_000; // arbitrary fixed timestamp
  const makeListResponse = (names: string[], hasMore = true) => ({
    results: names.map((name, idx) => ({
      name,
      url: `https://pokeapi.co/api/v2/pokemon/${idx + 1}/`,
    })),
    next: hasMore ? "next" : null,
    previous: null,
    count: names.length,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(fixedNow);

    // Defaults: no cache and no data
    (localStorage.loadPokemonList as jest.Mock).mockReturnValue(undefined);
    (localStorage.loadPaginationState as jest.Mock).mockReturnValue(undefined);
    currentQueryResult = {
      data: undefined,
      error: undefined,
      isFetching: false,
    };
    mockUseGetPokemonListQuery.mockReset();
    mockUseGetPokemonListQuery.mockImplementation(() => currentQueryResult);
  });

  afterEach(() => {
    (Date.now as jest.Mock).mockRestore?.();
  });

  it("hydrates from valid cache and skips fetching", async () => {
    const cachedPokemon = [
      { id: 1, name: "bulbasaur" },
      { id: 2, name: "ivysaur" },
    ];
    const cachedPagination = {
      currentPage: 1,
      totalLoaded: 2,
      hasMore: true,
      lastFetchTime: fixedNow - 60_000, // within cache window
    };
    (localStorage.loadPokemonList as jest.Mock).mockReturnValue(cachedPokemon);
    (localStorage.loadPaginationState as jest.Mock).mockReturnValue(
      cachedPagination
    );

    // Even if the query is called, we simulate no fetch
    mockUseGetPokemonListQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isFetching: false,
    });

    const { result } = renderHook(() => usePokemonList());

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.allPokemon).toEqual(cachedPokemon);
    expect(result.current.paginationState).toEqual(cachedPagination);
    expect(result.current.error).toBeNull();
  });

  it("fetches when no cache and populates list", async () => {
    const { result, rerender } = renderHook(() => usePokemonList());

    // After initial mount, the hook will trigger a rerender with skip=false
    act(() => {
      currentQueryResult = {
        data: makeListResponse(["bulbasaur", "ivysaur"], true),
        error: undefined,
        isFetching: false,
      } as any;
      mockUseGetPokemonListQuery.mockImplementation(() => currentQueryResult);
    });
    // Force a render to consume the new query result
    rerender();

    await waitFor(() => expect(result.current.allPokemon.length).toBe(2));
    expect(result.current.paginationState.currentPage).toBe(0);
    expect(result.current.paginationState.totalLoaded).toBe(2);
    expect(result.current.paginationState.hasMore).toBe(true);
    expect(localStorage.savePokemonList).toHaveBeenCalled();
    expect(localStorage.savePaginationState).toHaveBeenCalled();
  });

  it("loads more and de-duplicates items", async () => {
    const { result, rerender } = renderHook(() => usePokemonList());

    // First page
    act(() => {
      currentQueryResult = {
        data: makeListResponse(["bulbasaur", "ivysaur"], true),
        error: undefined,
        isFetching: false,
      } as any;
      mockUseGetPokemonListQuery.mockImplementation(() => currentQueryResult);
    });
    rerender();

    await waitFor(() => expect(result.current.allPokemon.length).toBe(2));

    // Next page: one duplicate (id 2) and one new (id 3)
    act(() => {
      currentQueryResult = {
        data: {
          results: [
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
            { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
          ],
          next: "next",
          previous: null,
          count: 2,
        },
        error: undefined,
        isFetching: false,
      } as any;
      mockUseGetPokemonListQuery.mockImplementation(() => currentQueryResult);
      result.current.loadMoreData();
    });
    rerender();

    await waitFor(() => expect(result.current.allPokemon.length).toBe(3));
    expect(result.current.allPokemon.map((p) => p.name)).toEqual([
      "bulbasaur",
      "ivysaur",
      "venusaur",
    ]);
  });

  it("handles refresh and triggers re-fetch", async () => {
    const { result, rerender } = renderHook(() => usePokemonList());

    // First fetch returns bulbasaur
    act(() => {
      currentQueryResult = {
        data: makeListResponse(["bulbasaur"], true),
        error: undefined,
        isFetching: false,
      } as any;
      mockUseGetPokemonListQuery.mockImplementation(() => currentQueryResult);
    });
    rerender();

    await waitFor(() => expect(result.current.allPokemon.length).toBe(1));

    // After refresh, next fetch returns ivysaur
    act(() => {
      currentQueryResult = {
        data: makeListResponse(["ivysaur"], true),
        error: undefined,
        isFetching: false,
      } as any;
      mockUseGetPokemonListQuery.mockImplementation(() => currentQueryResult);
      result.current.handleRefresh();
    });
    rerender();

    expect(localStorage.clearPokemonData).toHaveBeenCalled();
    await waitFor(() => expect(result.current.allPokemon.length).toBe(1));
    expect(result.current.allPokemon[0].name).toBe("ivysaur");
  });
});
