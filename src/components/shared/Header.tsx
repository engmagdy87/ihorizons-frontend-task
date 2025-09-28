import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Home } from "@mui/icons-material";

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title ? (
            capitalizeFirstLetter(title || "PokeReact")
          ) : (
            <RouterLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              PokeReact
            </RouterLink>
          )}
        </Typography>
        {title && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              component={RouterLink}
              to="/"
              color="inherit"
              size="small"
            >
              <Home />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
