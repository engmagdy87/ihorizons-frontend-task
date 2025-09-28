import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";

interface PokemonListItemProps {
  id: number;
  name: string;
}

const PokemonListItem: React.FC<PokemonListItemProps> = ({ id, name }) => {
  const navigate = useNavigate();

  const imageUrl = (id: number): string =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={() => navigate(`/pokemon/${id}`)}>
        <ListItemAvatar>
          <Avatar
            src={imageUrl(id) || ""}
            alt={name}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              variant="h6"
              sx={{
                textTransform: "capitalize",
                fontWeight: 400,
              }}
            >
              {name}
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

export default PokemonListItem;
