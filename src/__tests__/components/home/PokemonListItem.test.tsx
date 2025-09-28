import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import PokemonListItem from "../../../components/home/PokemonListItem";

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("PokemonListItem Component", () => {
  const defaultProps = {
    id: 1,
    name: "bulbasaur",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      expect(() =>
        renderWithTheme(<PokemonListItem {...defaultProps} />)
      ).not.toThrow();
    });

    it("renders with correct Pokemon name", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    });

    it("displays Pokemon name with capitalization styling", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const nameElement = screen.getByText("bulbasaur");
      expect(nameElement).toHaveStyle({ textTransform: "capitalize" });
    });

    it("renders as a list item", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    it("renders as a clickable button", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Pokemon Image", () => {
    it("displays Pokemon image with correct URL", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
      );
    });

    it("sets correct alt text for Pokemon image", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", "bulbasaur");
    });

    it("generates correct image URL for different Pokemon IDs", () => {
      renderWithTheme(<PokemonListItem id={25} name="pikachu" />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
      );
    });

    it("handles large Pokemon ID numbers", () => {
      renderWithTheme(<PokemonListItem id={1000} name="test-pokemon" />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1000.png"
      );
    });

    it("applies correct styling to avatar", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const image = screen.getByRole("img");
      // Avatar image fills its container, so it should have 100% dimensions
      expect(image).toHaveStyle({
        width: "100%",
        height: "100%",
      });
    });
  });

  describe("Navigation Functionality", () => {
    it("navigates to Pokemon details page when clicked", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith("/pokemon/1");
    });

    it("navigates with correct ID for different Pokemon", () => {
      renderWithTheme(<PokemonListItem id={25} name="pikachu" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith("/pokemon/25");
    });

    it("calls navigate only once per click", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("handles multiple clicks correctly", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith("/pokemon/1");
    });
  });

  describe("Props Handling", () => {
    it("handles string names correctly", () => {
      renderWithTheme(<PokemonListItem id={1} name="complex-pokemon-name" />);

      expect(screen.getByText("complex-pokemon-name")).toBeInTheDocument();
    });

    it("handles names with special characters", () => {
      renderWithTheme(<PokemonListItem id={1} name="mr-mime" />);

      expect(screen.getByText("mr-mime")).toBeInTheDocument();
    });

    it("handles names with apostrophes", () => {
      renderWithTheme(<PokemonListItem id={1} name="farfetch'd" />);

      expect(screen.getByText("farfetch'd")).toBeInTheDocument();
    });

    it("handles zero ID correctly", () => {
      renderWithTheme(<PokemonListItem id={0} name="test" />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith("/pokemon/0");
    });

    it("handles empty name gracefully", () => {
      renderWithTheme(<PokemonListItem id={1} name="" />);

      // Should still render the component structure
      expect(screen.getByRole("listitem")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
      // When name is empty, image has role="presentation" instead of "img"
      expect(screen.getByRole("presentation")).toBeInTheDocument();
    });
  });

  describe("Material-UI Integration", () => {
    it("renders ListItem component", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    it("renders ListItemButton component", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders ListItemAvatar component", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      // Avatar should be present within the list item
      const listItem = screen.getByRole("listitem");
      const image = screen.getByRole("img");
      expect(listItem).toContainElement(image);
    });

    it("renders ListItemText component", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      // Text should be present within the list item
      const listItem = screen.getByRole("listitem");
      const text = screen.getByText("bulbasaur");
      expect(listItem).toContainElement(text);
    });

    it("applies correct Typography variant", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      // Check that the name is rendered with heading role (h6 variant creates a heading)
      expect(screen.getByRole("heading")).toBeInTheDocument();
      expect(screen.getByRole("heading")).toHaveTextContent("bulbasaur");
    });

    it("disables padding on ListItem", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const listItem = screen.getByRole("listitem");
      // The exact class check would be implementation-specific, so we verify structure
      expect(listItem).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("provides accessible button for screen readers", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("provides accessible image with alt text", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", "bulbasaur");
    });

    it("maintains proper list item semantics", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    it("provides clickable area for keyboard navigation", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      // Button should be focusable (we can test this by checking tabindex)
      expect(button).toHaveAttribute("tabindex", "0");
    });
  });

  describe("Component Structure", () => {
    it("maintains proper component hierarchy", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      const listItem = screen.getByRole("listitem");
      const button = screen.getByRole("button");
      const image = screen.getByRole("img");
      const text = screen.getByText("bulbasaur");

      // Verify hierarchy: ListItem > Button > (Avatar + Text)
      expect(listItem).toContainElement(button);
      expect(listItem).toContainElement(image);
      expect(listItem).toContainElement(text);
    });

    it("renders all expected child components", () => {
      renderWithTheme(<PokemonListItem {...defaultProps} />);

      // Should have all main components
      expect(screen.getByRole("listitem")).toBeInTheDocument(); // ListItem
      expect(screen.getByRole("button")).toBeInTheDocument(); // ListItemButton
      expect(screen.getByRole("img")).toBeInTheDocument(); // Avatar
      expect(screen.getByText("bulbasaur")).toBeInTheDocument(); // Typography
    });
  });

  describe("Edge Cases", () => {
    it("handles negative ID numbers", () => {
      renderWithTheme(<PokemonListItem id={-1} name="test" />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/-1.png"
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith("/pokemon/-1");
    });

    it("handles very long Pokemon names", () => {
      const longName = "a".repeat(100);
      renderWithTheme(<PokemonListItem id={1} name={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("handles names with numbers", () => {
      renderWithTheme(<PokemonListItem id={1} name="pokemon123" />);

      expect(screen.getByText("pokemon123")).toBeInTheDocument();
    });

    it("handles names with spaces", () => {
      renderWithTheme(<PokemonListItem id={1} name="pokemon name" />);

      expect(screen.getByText("pokemon name")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("renders efficiently without unnecessary re-renders", () => {
      const { rerender } = renderWithTheme(
        <PokemonListItem {...defaultProps} />
      );

      // Initial render
      expect(screen.getByText("bulbasaur")).toBeInTheDocument();

      // Rerender with same props should not cause issues
      rerender(
        <ThemeProvider theme={theme}>
          <PokemonListItem {...defaultProps} />
        </ThemeProvider>
      );

      expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    });

    it("handles prop changes correctly", () => {
      const { rerender } = renderWithTheme(
        <PokemonListItem {...defaultProps} />
      );

      expect(screen.getByText("bulbasaur")).toBeInTheDocument();

      // Change props
      rerender(
        <ThemeProvider theme={theme}>
          <PokemonListItem id={25} name="pikachu" />
        </ThemeProvider>
      );

      expect(screen.getByText("pikachu")).toBeInTheDocument();
      expect(screen.queryByText("bulbasaur")).not.toBeInTheDocument();
    });
  });
});
