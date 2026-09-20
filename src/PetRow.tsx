import { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Input from "@mui/material/Input";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import AddCircle from "@mui/icons-material/AddCircle";
import AddComment from "@mui/icons-material/AddComment";
import RecordVoiceOver from "@mui/icons-material/RecordVoiceOver";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Refresh from "@mui/icons-material/Refresh";
import LinkOff from "@mui/icons-material/LinkOff";
import OBR from "@owlbear-rodeo/sdk";
import type { Image, Item } from "@owlbear-rodeo/sdk";
import {
  allResourcesSpent,
  decrementResource,
  resetResources,
  updateInitiative,
  TEAM_COLORS,
  type InitiativeData,
} from "./initiative";
import { ResourceCounter } from "./ResourceCounter";

interface Props {
  item: Item;
  data: InitiativeData;
  onDelete: () => void;
  onUnlink: () => void;
}

export function PetRow({ item, data, onDelete, onUnlink }: Props) {
  const [menu, setMenu] = useState<HTMLElement | null>(null);

  const disabled = allResourcesSpent(data);
  const image = (item as Image).image?.url;
  const teamColor = data.team ? TEAM_COLORS[data.team] : "divider";

  const dec = (key: "action" | "bonus" | "reaction") => () => {
    decrementResource([item.id], key);
  };

  const focusCharacter = async () => {
    await OBR.player.select([item.id]);
    const bounds = await OBR.scene.items.getItemBounds([item.id]);
    await OBR.viewport.animateToBounds(bounds);
  };

  const initials = item.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const renderAvatar = () => {
    if (image) {
      return (
        <Avatar
          src={image}
          sx={{
            width: 20,
            height: 20,
            fontSize: 8,
            fontWeight: 700,
            filter: disabled ? "grayscale(1)" : "none",
            opacity: disabled ? 0.4 : 1,
            backgroundColor: "action.selected",
          }}
        >
          <Avatar
            sx={{
              width: 16,
              height: 16,
              bgcolor: disabled ? "action.selected" : "primary.main",
              color: "background.paper",
              fontSize: 8,
              fontWeight: 700,
              opacity: disabled ? 0.4 : 1,
            }}
          >
            {initials}
          </Avatar>
        </Avatar>
      );
    }
    return (
      <Avatar
        sx={{
          width: 20,
          height: 20,
          bgcolor: disabled ? "action.selected" : "primary.main",
          color: "background.paper",
          fontSize: 8,
          fontWeight: 700,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {initials}
      </Avatar>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.75,
        py: 0.25,
        ml: 3,
        borderLeft: `2px solid`,
        borderColor: teamColor,
        borderRadius: "0 6px 6px 0",
        bgcolor: "transparent",
        transition: "background-color .2s",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <Box onClick={focusCharacter} sx={{ cursor: "pointer", flexShrink: 0 }}>
        {renderAvatar()}
      </Box>

      <Box sx={{ minWidth: 0, flexShrink: 1, flexGrow: 1 }}>
        <Input
          disableUnderline
          fullWidth
          inputProps={{
            sx: {
              fontWeight: 500,
              fontSize: "0.75rem",
              lineHeight: 1.3,
              py: 0,
              color: disabled ? "text.disabled" : "text.primary",
            },
          }}
          value={item.name}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            OBR.scene.items.updateItems([item.id], (draft) => {
              draft[0].name = e.target.value;
            });
          }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
        <ResourceCounter
          label="Acción"
          icon={<AddCircle />}
          value={data.action}
          max={data.maxAction}
          onClick={dec("action")}
          compact
        />
        <ResourceCounter
          label="Bonus"
          icon={<AddComment />}
          value={data.bonus}
          max={data.maxBonus}
          onClick={dec("bonus")}
          compact
        />
        <ResourceCounter
          label="Reacción"
          icon={<RecordVoiceOver />}
          value={data.reaction}
          max={data.maxReaction}
          onClick={dec("reaction")}
          compact
        />
      </Box>

      <IconButton size="small" sx={{ p: 0.5 }} onClick={(e) => setMenu(e.currentTarget)}>
        <MoreVert sx={{ fontSize: 16 }} />
      </IconButton>

      <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            updateInitiative([item.id], resetResources);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Reiniciar recursos" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onUnlink();
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <LinkOff fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Desvincular" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete();
            setMenu(null);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Eliminar de la iniciativa" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
