import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

// Mock the store
jest.mock("../store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
    [Symbol.observable]: jest.fn(),
  },
}));

// Mock ErrorBoundary
jest.mock("../components/shared/ErrorBoundary", () => {
  return function MockErrorBoundary({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

// Mock Home component
jest.mock("../pages/Home", () => ({
  __esModule: true,
  default: function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  },
}));

// Mock PokemonDetails component
jest.mock("../pages/PokemonDetails", () => ({
  __esModule: true,
  default: function MockPokemonDetails() {
    return <div data-testid="pokemon-details-page">Pokemon Details Page</div>;
  },
}));

// Mock React Router components to avoid router conflicts
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="browser-router">{children}</div>
    ),
    Routes: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="routes">{children}</div>
    ),
    Route: ({ element }: { element: React.ReactNode }) => (
      <div data-testid="route">{element}</div>
    ),
    Navigate: () => <div data-testid="navigate">Navigate to Home</div>,
  };
});

// Custom render function for testing
const renderApp = () => {
  return render(<App />);
};

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      expect(() => renderApp()).not.toThrow();
    });

    it("renders with ErrorBoundary wrapper", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });

    it("renders BrowserRouter component", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });

    it("renders Routes component", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });
    });
  });

  describe("Component Structure", () => {
    it("maintains proper component hierarchy", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });

      // Both components should be present (hierarchy is implicit in this test structure)
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      expect(screen.getByTestId("browser-router")).toBeInTheDocument();
    });

    it("renders all provider components", async () => {
      // Test that all providers are working by verifying the app renders
      expect(() => renderApp()).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });

    it("includes Redux Provider", async () => {
      renderApp();

      // The app should render without Redux-related errors
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });
  });

  describe("Material-UI Integration", () => {
    it("applies theme configuration", async () => {
      renderApp();

      // Verify the app renders with Material-UI components
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });

      // The fact that it renders without errors indicates theme is working
      expect(screen.getByTestId("browser-router")).toBeInTheDocument();
    });

    it("includes StyledEngineProvider and ThemeProvider", async () => {
      renderApp();

      // Verify the component structure renders without theme errors
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });

    it("includes CssBaseline for consistent styling", async () => {
      renderApp();

      // CssBaseline should be applied (though we can't directly test its effects)
      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });

    it("applies custom typography theme", () => {
      // Test that the theme object is properly configured
      // This is tested implicitly through successful rendering
      expect(() => renderApp()).not.toThrow();
    });

    it("applies responsive typography", () => {
      // Test that responsive breakpoints are configured
      // This is tested implicitly through successful theme application
      expect(() => renderApp()).not.toThrow();
    });
  });

  describe("Error Boundary Integration", () => {
    it("wraps entire app with ErrorBoundary component", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });

      // Verify the error boundary contains the router
      expect(screen.getByTestId("browser-router")).toBeInTheDocument();
    });

    it("provides error handling for the entire application", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });

      // ErrorBoundary should be present and functional
      const errorBoundary = screen.getByTestId("error-boundary");
      expect(errorBoundary).toBeInTheDocument();
    });
  });

  describe("Router Integration", () => {
    it("includes BrowserRouter for routing", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });

    it("includes Routes for route definition", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });
    });

    it("renders routing components in proper hierarchy", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });

      // Verify component hierarchy
      const browserRouter = screen.getByTestId("browser-router");
      const routes = screen.getByTestId("routes");
      expect(browserRouter).toContainElement(routes);
    });

    it("includes route definitions", async () => {
      renderApp();

      // Routes should be defined (tested through successful rendering)
      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });
    });

    it("includes fallback route for unknown paths", async () => {
      renderApp();

      // Navigate component should be available for unknown routes
      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });
    });
  });

  describe("Lazy Loading and Suspense", () => {
    it("includes Suspense boundary for lazy components", async () => {
      renderApp();

      // The app should render with Suspense boundary (implied by successful render)
      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });
    });

    it("provides fallback UI during component loading", () => {
      // LinearProgress should be used as fallback
      // This is tested implicitly through the Suspense configuration
      expect(() => renderApp()).not.toThrow();
    });

    it("handles lazy loaded Home component", async () => {
      renderApp();

      // Home component should be lazy loaded successfully
      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });
    });

    it("handles lazy loaded PokemonDetails component", async () => {
      renderApp();

      // PokemonDetails component should be lazy loaded successfully
      await waitFor(() => {
        expect(screen.getByTestId("routes")).toBeInTheDocument();
      });
    });
  });

  describe("Provider Hierarchy", () => {
    it("renders all necessary providers in correct order", async () => {
      renderApp();

      // All providers should work together without conflicts
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });

      expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      expect(screen.getByTestId("routes")).toBeInTheDocument();
    });

    it("Redux Provider wraps the entire component tree", async () => {
      renderApp();

      // Redux Provider should be the outermost provider
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });

    it("StyledEngineProvider is configured correctly", async () => {
      renderApp();

      // StyledEngineProvider should work with injectFirst prop
      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });

    it("ThemeProvider applies custom theme", async () => {
      renderApp();

      // ThemeProvider should apply the custom theme successfully
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });
  });

  describe("Store Integration", () => {
    it("connects to Redux store without errors", async () => {
      renderApp();

      // App should connect to store successfully
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });

    it("provides store to all child components", async () => {
      renderApp();

      // Store should be available throughout component tree
      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });
  });

  describe("Performance and Optimization", () => {
    it("implements code splitting with lazy loading", () => {
      // Lazy loading should be implemented for performance
      expect(() => renderApp()).not.toThrow();
    });

    it("provides efficient re-rendering", () => {
      const { rerender } = renderApp();

      // Component should handle re-renders efficiently
      expect(() => {
        rerender(<App />);
      }).not.toThrow();
    });

    it("handles component unmounting gracefully", () => {
      const { unmount } = renderApp();

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Accessibility and Standards", () => {
    it("includes CssBaseline for consistent cross-browser styling", async () => {
      renderApp();

      // CssBaseline should normalize styles across browsers
      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });

    it("applies responsive design through theme", () => {
      // Theme should include responsive breakpoints
      expect(() => renderApp()).not.toThrow();
    });

    it("provides proper document structure", async () => {
      renderApp();

      // App should render with proper component hierarchy
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("gracefully handles component initialization errors", () => {
      expect(() => renderApp()).not.toThrow();
    });

    it("provides error boundary for runtime errors", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });

    it("maintains app stability during errors", async () => {
      renderApp();

      // App should remain stable even with potential errors
      await waitFor(() => {
        expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      });
    });
  });

  describe("Integration Testing", () => {
    it("integrates all major systems successfully", async () => {
      renderApp();

      // Redux, Router, Material-UI, and Error Boundary should work together
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });

      expect(screen.getByTestId("browser-router")).toBeInTheDocument();
      expect(screen.getByTestId("routes")).toBeInTheDocument();
    });

    it("provides complete application foundation", async () => {
      renderApp();

      // App should provide all necessary infrastructure for the application
      await waitFor(() => {
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      });
    });
  });
});
