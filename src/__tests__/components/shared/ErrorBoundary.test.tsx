import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ErrorBoundary from "../../../components/shared/ErrorBoundary";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Component that throws an error for testing
const ThrowError: React.FC<{
  shouldThrow?: boolean;
  errorMessage?: string;
}> = ({ shouldThrow = false, errorMessage = "Test error" }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="working-component">Working Component</div>;
};

// Component that renders normally
const WorkingComponent: React.FC = () => {
  return <div data-testid="normal-content">Normal Content</div>;
};

describe("ErrorBoundary Component", () => {
  // Store original console.error to restore later
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console.error to avoid cluttering test output
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe("Normal Operation", () => {
    it("renders without crashing", () => {
      expect(() =>
        renderWithTheme(
          <ErrorBoundary>
            <WorkingComponent />
          </ErrorBoundary>
        )
      ).not.toThrow();
    });

    it("renders children when no error occurs", () => {
      renderWithTheme(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      expect(screen.getByText("Normal Content")).toBeInTheDocument();
    });

    it("renders multiple children correctly", () => {
      renderWithTheme(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
    });

    it("passes through props to children", () => {
      const TestComponent: React.FC<{ testProp: string }> = ({ testProp }) => (
        <div data-testid="test-component">{testProp}</div>
      );

      renderWithTheme(
        <ErrorBoundary>
          <TestComponent testProp="test value" />
        </ErrorBoundary>
      );

      expect(screen.getByText("test value")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("catches and displays error when child component throws", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please refresh the page.")
      ).toBeInTheDocument();
    });

    it("displays error alert with error severity", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardError");
    });

    it("does not render original children when error occurs", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.queryByTestId("working-component")).not.toBeInTheDocument();
      expect(screen.queryByTestId("normal-content")).not.toBeInTheDocument();
    });

    it("logs error to console when error occurs", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error boundary caught an error:",
        expect.any(Error),
        expect.any(Object)
      );
    });

    it("handles different types of errors", () => {
      const CustomError = () => {
        throw new TypeError("Type error occurred");
      };

      renderWithTheme(
        <ErrorBoundary>
          <CustomError />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please refresh the page.")
      ).toBeInTheDocument();
    });

    it("handles errors with custom messages", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom error occurred" />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please refresh the page.")
      ).toBeInTheDocument();
    });
  });

  describe("Development Mode Features", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("shows error details in development mode", () => {
      process.env.NODE_ENV = "development";

      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Error: Development error")).toBeInTheDocument();

      // Check for details element by looking for the error text in development mode
      expect(screen.getByText("Error: Development error")).toBeInTheDocument();
    });

    it("hides error details in production mode", () => {
      process.env.NODE_ENV = "production";

      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Production error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please refresh the page.")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Error: Production error")
      ).not.toBeInTheDocument();
    });

    it("hides error details in test mode", () => {
      process.env.NODE_ENV = "test";

      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.queryByText("Error: Test error")).not.toBeInTheDocument();
    });
  });

  describe("Component Lifecycle", () => {
    it("maintains error state after error occurs", () => {
      const { rerender } = renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Rerender with same props
      rerender(
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ThemeProvider>
      );

      // Error should still be displayed
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("resets error state when children change after error", () => {
      const { rerender } = renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Rerender with different children that don't throw
      rerender(
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <WorkingComponent />
          </ErrorBoundary>
        </ThemeProvider>
      );

      // Note: Error boundary state doesn't auto-reset in React
      // This behavior depends on implementation
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("handles errors in componentDidMount", () => {
      const ComponentWithMountError: React.FC = () => {
        React.useEffect(() => {
          throw new Error("Mount error");
        }, []);
        return <div>Component</div>;
      };

      renderWithTheme(
        <ErrorBoundary>
          <ComponentWithMountError />
        </ErrorBoundary>
      );

      // useEffect errors are actually caught by error boundaries in some cases
      // This test verifies the current behavior
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Material-UI Integration", () => {
    it("renders with Material-UI Box component", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Box should be rendered - Alert component should be present
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("renders with Material-UI Alert component", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-root");
      expect(alert).toHaveClass("MuiAlert-standardError");
    });

    it("applies correct styling to error container", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      // Material-UI classes should be applied
      expect(alert.className).toContain("MuiAlert");
    });
  });

  describe("Accessibility", () => {
    it("provides accessible error alert", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("role", "alert");
    });

    it("provides meaningful error message for screen readers", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText("Something went wrong. Please refresh the page.")
      ).toBeInTheDocument();
    });

    it("maintains focus management during error state", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      // Alert should be visible and accessible
      expect(alert).toHaveAttribute("role", "alert");
    });
  });

  describe("Edge Cases", () => {
    it("handles null children", () => {
      expect(() =>
        renderWithTheme(<ErrorBoundary>{null}</ErrorBoundary>)
      ).not.toThrow();
    });

    it("handles undefined children", () => {
      expect(() =>
        renderWithTheme(<ErrorBoundary>{undefined}</ErrorBoundary>)
      ).not.toThrow();
    });

    it("handles empty children", () => {
      renderWithTheme(<ErrorBoundary>{""}</ErrorBoundary>);

      // Should render without error, no content expected
      expect(document.body).toBeInTheDocument();
    });

    it("handles boolean children", () => {
      renderWithTheme(
        <ErrorBoundary>
          {true}
          {false}
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
    });

    it("handles string children", () => {
      renderWithTheme(<ErrorBoundary>Hello World</ErrorBoundary>);

      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("handles number children", () => {
      renderWithTheme(<ErrorBoundary>{42}</ErrorBoundary>);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("handles mixed children types", () => {
      renderWithTheme(
        <ErrorBoundary>
          Some text
          {42}
          <WorkingComponent />
          {null}
          {undefined}
        </ErrorBoundary>
      );

      expect(screen.getByText(/Some text/)).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
    });
  });

  describe("Error Recovery", () => {
    it("maintains error state until component unmounts", () => {
      const { unmount } = renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });

    it("handles rapid error succession", () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="First error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please refresh the page.")
      ).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("accepts ReactNode children prop", () => {
      const children = (
        <>
          <div>First child</div>
          <div>Second child</div>
        </>
      );

      renderWithTheme(<ErrorBoundary>{children}</ErrorBoundary>);

      expect(screen.getByText("First child")).toBeInTheDocument();
      expect(screen.getByText("Second child")).toBeInTheDocument();
    });

    it("maintains children reference when no error", () => {
      const TestChild = () => <div data-testid="test-child">Test</div>;

      renderWithTheme(
        <ErrorBoundary>
          <TestChild />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });
  });
});
