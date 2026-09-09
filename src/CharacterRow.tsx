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
import OBR from "@owlbear-rodeo/sdk";
import type { Image, Item } from "@owlbear-rodeo/sdk";
import {
  allResourcesSpent,
  decrementResource,
  updateInitiative,
  resetResources,
  type InitiativeData,
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
}

export function CharacterRow({ item, data, active, onDelete }: Props) {
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);

  const disabled = allResourcesSpent(data);
  const image = (item as Image).image?.url;

  const dec = (key: "action" | "bonus" | "reaction") => () => {
    decrementResource([item.id], key);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.75,
        borderRadius: "8px",
        bgcolor: active ? "action.selected" : "transparent",
        border: active ? "1.5px solid" : "1px solid",
        borderColor: active ? "primary.main" : "transparent",
        transition: "background-color .2s, border-color .2s",
        "&:hover": {
          bgcolor: active ? "action.selected" : "action.hover",
        },
      }}
    >
      {image ? (
        <Avatar
          src={image}
          sx={{
            width: 36,
            height: 36,
            fontSize: 14,
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