import React, { Suspense } from "react";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LinearProgress } from "@mui/material";

import { store } from "./store";
import ErrorBoundary from "./components/shared/ErrorBoundary";

// Lazy load pages
const Home = React.lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.default }))
);
const PokemonDetails = React.lazy(() =>
  import("./pages/PokemonDetails").then((module) => ({
    default: module.default,
  }))
);

const theme = createTheme({
  typography: {
    h4: {
      fontSize: "2.5rem",
      "@media (max-width:600px)": {
        fontSize: "2rem",
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <ErrorBoundary>
              <Suspense fallback={<LinearProgress />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pokemon/:id" element={<PokemonDetails />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Router>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
};

export default App;
