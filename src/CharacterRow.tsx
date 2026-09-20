import { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Input from "@mui/material/Input";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MoreVert from "@mui/icons-material/MoreVert";
import AddCircle from "@mui/icons-material/AddCircle";
import AddComment from "@mui/icons-material/AddComment";
import RecordVoiceOver from "@mui/icons-material/RecordVoiceOver";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronRight from "@mui/icons-material/ChevronRight";
import OBR from "@owlbear-rodeo/sdk";
import type { Image, Item } from "@owlbear-rodeo/sdk";
import {
  allResourcesSpent,
  decrementResource,
  updateInitiative,
  resetResources,
  TEAM_COLORS,
  type InitiativeData,
  type TeamKey,
} from "./initiative";
import { ResourceCounter } from "./ResourceCounter";
import { DefaultAvatar } from "./DefaultAvatar";
import { CharacterMenu } from "./CharacterMenu";
import { EditResourcesDialog } from "./EditResourcesDialog";

interface Props {
  item: Item;
  data: InitiativeData;
  active: boolean;
  onDelete: () => void;
  /** Number of pets linked to this character */
  petCount?: number;
  /** Whether the pet list is expanded */
  expanded?: boolean;
  /** Toggle pet list expand/collapse */
  onToggleExpand?: () => void;
  /** Available parents for linking (for the menu) */
  availableParents?: Array<{ id: string; name: string; imageUrl?: string }>;
  /** Called when this character is linked to a parent as a pet */
  onLink?: (parentId: string) => void;
}

export function CharacterRow({
  item,
  data,
  active,
  onDelete,
  petCount = 0,
  expanded = false,
  onToggleExpand,
  availableParents,
  onLink,
}: Props) {
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);

  const disabled = allResourcesSpent(data);
  const image = (item as Image).image?.url;
  const teamColor = data.team ? TEAM_COLORS[data.team] : undefined;

  const dec = (key: "action" | "bonus" | "reaction") => () => {
    decrementResource([item.id], key);
  };

  const focusCharacter = async () => {
    await OBR.player.select([item.id]);
    const bounds = await OBR.scene.items.getItemBounds([item.id]);
    await OBR.viewport.animateToBounds(bounds);
  };

  const handleTeamChange = (team: TeamKey | undefined) => {
    updateInitiative([item.id], (current) => ({
      ...current,
      team,
    }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 0.75,
        py: 0.5,
        borderRadius: "6px",
        bgcolor: active ? "action.selected" : "transparent",
        border: active ? "1.5px solid" : "1px solid",
        borderColor: active ? "primary.main" : "transparent",
        borderLeft: teamColor
          ? `3px solid ${teamColor}`
          : active
          ? "1.5px solid"
          : "1px solid",
        borderLeftColor: teamColor ?? (active ? "primary.main" : "transparent"),
        transition: "background-color .2s, border-color .2s",
        "&:hover": {
          bgcolor: active ? "action.selected" : "action.hover",
        },
      }}
    >
      {/* Chevron for pets */}
      {petCount > 0 && onToggleExpand ? (
        <IconButton
          size="small"
          onClick={onToggleExpand}
          sx={{ p: 0, mr: -0.5 }}
        >
          {expanded ? (
            <ExpandMore sx={{ fontSize: 16 }} />
          ) : (
            <ChevronRight sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      ) : null}

      <Box
        onClick={focusCharacter}
        sx={{ cursor: "pointer", flexShrink: 0 }}
      >
        {image ? (
          <Avatar
            src={image}
            sx={{
              width: 30,
              height: 30,
              fontSize: 12,
              fontWeight: 700,
              filter: disabled ? "grayscale(1)" : "none",
              opacity: disabled ? 0.4 : 1,
              backgroundColor: "action.selected",
            }}
          >
            <DefaultAvatar name={item.name} disabled={disabled} />
          </Avatar>
        ) : (
          <DefaultAvatar name={item.name} disabled={disabled} />
        )}
      </Box>

      <Box sx={{ minWidth: 0, flexShrink: 1 }}>
        <Input
          disableUnderline
          fullWidth
          inputProps={{
            sx: {
              fontWeight: 600,
              fontSize: "0.8125rem",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Input
            disableUnderline
            sx={{ width: 44 }}
            inputProps={{
              sx: {
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "text.secondary",
                textAlign: "right",
                py: 0,
              },
            }}
            value={data.initiative}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              updateInitiative([item.id], (current) => ({
                ...current,
                initiative: Number.isNaN(parsed) ? 0 : parsed,
              }));
            }}
          />
          {active && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
              · Turno
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
        <ResourceCounter
          label="Acción"
          icon={<AddCircle />}
          value={data.action}
          max={data.maxAction}
          onClick={dec("action")}
        />
        <ResourceCounter
          label="Bonus"
          icon={<AddComment />}
          value={data.bonus}
          max={data.maxBonus}
          onClick={dec("bonus")}
        />
        <ResourceCounter
          label="Reacción"
          icon={<RecordVoiceOver />}
          value={data.reaction}
          max={data.maxReaction}
          onClick={dec("reaction")}
        />
      </Box>

      <IconButton size="small" onClick={(e) => setMenu(e.currentTarget)}>
        <MoreVert sx={{ fontSize: 18 }} />
      </IconButton>

      <CharacterMenu
        anchorEl={menu}
        onClose={() => setMenu(null)}
        onDelete={onDelete}
        onReset={() => updateInitiative([item.id], resetResources)}
        onEdit={() => setEditing(true)}
        team={data.team}
        onTeamChange={handleTeamChange}
        availableParents={availableParents}
        onLink={onLink}
      />

      <EditResourcesDialog
        open={editing}
        data={data}
        onClose={() => setEditing(false)}
        onSave={(updated) => updateInitiative([item.id], () => updated)}
      />
    </Box>
  );
}