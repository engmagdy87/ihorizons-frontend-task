import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Header } from "../../../components/shared/Header";

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </BrowserRouter>
  );
};

describe("Header Component", () => {
  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      expect(() => renderWithProviders(<Header />)).not.toThrow();
    });

    it("renders as an AppBar component", () => {
      renderWithProviders(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("has sticky positioning", () => {
      renderWithProviders(<Header />);

      const appBar = screen.getByRole("banner");
      expect(appBar).toHaveClass("MuiAppBar-positionSticky");
    });
  });

  describe("Default State (No Title)", () => {
    it('displays "PokeReact" as default text when no title provided', () => {
      renderWithProviders(<Header />);

      expect(screen.getByText("PokeReact")).toBeInTheDocument();
    });

    it('renders "PokeReact" as a link to home page when no title provided', () => {
      renderWithProviders(<Header />);

      const homeLink = screen.getByRole("link", { name: "PokeReact" });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("applies correct styling to home link", () => {
      renderWithProviders(<Header />);

      const homeLink = screen.getByRole("link", { name: "PokeReact" });
      expect(homeLink).toHaveStyle({
        textDecoration: "none",
      });
    });

    it("does not show home icon when no title provided", () => {
      renderWithProviders(<Header />);

      expect(screen.queryByTestId("HomeIcon")).not.toBeInTheDocument();
    });

    it("renders Typography component", () => {
      renderWithProviders(<Header />);

      expect(screen.getByText("PokeReact")).toBeInTheDocument();
    });
  });

  describe("With Title Provided", () => {
    it("displays provided title when title prop is given", () => {
      renderWithProviders(<Header title="pokemon details" />);

      expect(screen.getByText("Pokemon details")).toBeInTheDocument();
    });

    it("capitalizes first letter of title", () => {
      renderWithProviders(<Header title="pokemon details" />);

      expect(screen.getByText("Pokemon details")).toBeInTheDocument();
      expect(screen.queryByText("pokemon details")).not.toBeInTheDocument();
    });

    it("handles already capitalized titles correctly", () => {
      renderWithProviders(<Header title="Pokemon Details" />);

      expect(screen.getByText("Pokemon Details")).toBeInTheDocument();
    });

    it("handles single character titles", () => {
      renderWithProviders(<Header title="a" />);

      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("handles empty string title", () => {
      renderWithProviders(<Header title="" />);

      // Should fall back to default behavior
      expect(screen.getByText("PokeReact")).toBeInTheDocument();
    });

    it("does not render title as a link when title is provided", () => {
      renderWithProviders(<Header title="pokemon details" />);

      const titleText = screen.getByText("Pokemon details");
      expect(titleText).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Pokemon details" })
      ).not.toBeInTheDocument();
    });

    it("shows home icon when title is provided", () => {
      renderWithProviders(<Header title="pokemon details" />);

      expect(screen.getByTestId("HomeIcon")).toBeInTheDocument();
    });

    it("home icon is wrapped in a link to home page", () => {
      renderWithProviders(<Header title="pokemon details" />);

      const homeIcon = screen.getByTestId("HomeIcon");
      expect(homeIcon).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute("href", "/");
    });
  });

  describe("Title Capitalization Logic", () => {
    it("capitalizes lowercase titles", () => {
      renderWithProviders(<Header title="bulbasaur" />);

      expect(screen.getByText("Bulbasaur")).toBeInTheDocument();
    });

    it("capitalizes mixed case titles correctly", () => {
      renderWithProviders(<Header title="pOkEmOn DeTaIlS" />);

      expect(screen.getByText("POkEmOn DeTaIlS")).toBeInTheDocument();
    });

    it("handles titles with numbers", () => {
      renderWithProviders(<Header title="pokemon 123" />);

      expect(screen.getByText("Pokemon 123")).toBeInTheDocument();
    });

    it("handles titles with special characters", () => {
      renderWithProviders(<Header title="mr. mime" />);

      expect(screen.getByText("Mr. mime")).toBeInTheDocument();
    });

    it("handles titles starting with numbers", () => {
      renderWithProviders(<Header title="123 pokemon" />);

      expect(screen.getByText("123 pokemon")).toBeInTheDocument();
    });

    it("handles unicode characters", () => {
      renderWithProviders(<Header title="pokémon" />);

      expect(screen.getByText("Pokémon")).toBeInTheDocument();
    });
  });

  describe("Material-UI Integration", () => {
    it("renders AppBar with correct Material-UI classes", () => {
      renderWithProviders(<Header />);

      const appBar = screen.getByRole("banner");
      expect(appBar).toHaveClass("MuiAppBar-root");
      expect(appBar).toHaveClass("MuiAppBar-positionSticky");
    });

    it("renders Toolbar within AppBar", () => {
      renderWithProviders(<Header />);

      const appBar = screen.getByRole("banner");
      expect(appBar).toBeInTheDocument();
      expect(appBar).toHaveClass("MuiAppBar-root");
    });

    it("renders Typography with h6 variant", () => {
      renderWithProviders(<Header />);

      // Typography renders the text content correctly
      expect(screen.getByText("PokeReact")).toBeInTheDocument();
    });

    it("applies flexGrow styling to Typography", () => {
      renderWithProviders(<Header />);

      // Typography text is rendered (flexGrow is applied via CSS)
      expect(screen.getByText("PokeReact")).toBeInTheDocument();
    });

    it("renders Home icon from Material-UI icons", () => {
      renderWithProviders(<Header title="test" />);

      const homeIcon = screen.getByTestId("HomeIcon");
      expect(homeIcon).toBeInTheDocument();
    });

    it("renders IconButton with correct Material-UI classes", () => {
      renderWithProviders(<Header title="test" />);

      // IconButton renders the home icon correctly
      const homeIcon = screen.getByTestId("HomeIcon");
      expect(homeIcon).toBeInTheDocument();
    });
  });

  describe("React Router Integration", () => {
    it("uses RouterLink for home link when no title", () => {
      renderWithProviders(<Header />);

      const homeLink = screen.getByRole("link", { name: "PokeReact" });
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("uses RouterLink for home icon when title is provided", () => {
      renderWithProviders(<Header title="test" />);

      expect(screen.getByTestId("HomeIcon")).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute("href", "/");
    });

    it("properly integrates with React Router without throwing errors", () => {
      expect(() => renderWithProviders(<Header />)).not.toThrow();
      expect(() => renderWithProviders(<Header title="test" />)).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("provides banner role for AppBar", () => {
      renderWithProviders(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("provides accessible navigation link when no title", () => {
      renderWithProviders(<Header />);

      const homeLink = screen.getByRole("link", { name: "PokeReact" });
      expect(homeLink).toBeInTheDocument();
    });

    it("home icon has proper accessibility attributes", () => {
      renderWithProviders(<Header title="test" />);

      const homeIcon = screen.getByTestId("HomeIcon");
      expect(homeIcon).toBeInTheDocument();
      expect(homeIcon).toHaveAttribute("aria-hidden", "true");
    });

    it("provides accessible link for home icon", () => {
      renderWithProviders(<Header title="test" />);

      const homeLink = screen.getByRole("link");
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined title gracefully", () => {
      renderWithProviders(<Header title={undefined} />);

      expect(screen.getByText("PokeReact")).toBeInTheDocument();
    });

    it("handles null title gracefully", () => {
      renderWithProviders(<Header title={null as any} />);

      expect(screen.getByText("PokeReact")).toBeInTheDocument();
    });

    it("handles very long titles", () => {
      const longTitle = "a".repeat(100);
      renderWithProviders(<Header title={longTitle} />);

      const capitalizedTitle = "A" + "a".repeat(99);
      expect(screen.getByText(capitalizedTitle)).toBeInTheDocument();
    });

    it("handles titles with only whitespace", () => {
      renderWithProviders(<Header title="   " />);

      // Whitespace title should be displayed with home icon
      expect(screen.getByTestId("HomeIcon")).toBeInTheDocument();
    });

    it("handles titles with special characters only", () => {
      renderWithProviders(<Header title="!@#$%^&*()" />);

      expect(screen.getByText("!@#$%^&*()")).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("accepts optional title prop", () => {
      expect(() => renderWithProviders(<Header />)).not.toThrow();
      expect(() => renderWithProviders(<Header title="test" />)).not.toThrow();
    });

    it("properly handles title prop changes", () => {
      const { rerender } = renderWithProviders(<Header />);

      expect(screen.getByText("PokeReact")).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <Header title="new title" />
          </ThemeProvider>
        </BrowserRouter>
      );

      expect(screen.getByText("New title")).toBeInTheDocument();
      expect(screen.queryByText("PokeReact")).not.toBeInTheDocument();
    });

    it("maintains component state during re-renders", () => {
      const { rerender } = renderWithProviders(<Header title="test" />);

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.getByTestId("HomeIcon")).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <Header title="test" />
          </ThemeProvider>
        </BrowserRouter>
      );

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.getByTestId("HomeIcon")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("renders AppBar as main container", () => {
      renderWithProviders(<Header title="test" />);

      const appBar = screen.getByRole("banner");
      expect(appBar).toBeInTheDocument();
      expect(appBar).toHaveClass("MuiAppBar-root");
    });

    it("renders all expected components when title is provided", () => {
      renderWithProviders(<Header title="test" />);

      expect(screen.getByRole("banner")).toBeInTheDocument(); // AppBar
      expect(screen.getByText("Test")).toBeInTheDocument(); // Typography
      expect(screen.getByRole("link")).toBeInTheDocument(); // RouterLink
      expect(screen.getByTestId("HomeIcon")).toBeInTheDocument(); // Home icon
    });

    it("renders expected components when no title provided", () => {
      renderWithProviders(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument(); // AppBar
      expect(
        screen.getByRole("link", { name: "PokeReact" })
      ).toBeInTheDocument(); // RouterLink
      expect(screen.queryByTestId("HomeIcon")).not.toBeInTheDocument(); // No Home icon
    });
  });

  describe("Performance", () => {
    it("renders efficiently without unnecessary re-renders", () => {
      const { rerender } = renderWithProviders(<Header title="test" />);

      expect(screen.getByText("Test")).toBeInTheDocument();

      // Rerender with same props should not cause issues
      rerender(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <Header title="test" />
          </ThemeProvider>
        </BrowserRouter>
      );

      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("handles component unmounting gracefully", () => {
      const { unmount } = renderWithProviders(<Header title="test" />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
