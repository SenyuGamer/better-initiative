import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Refresh from "@mui/icons-material/Refresh";
import Edit from "@mui/icons-material/Edit";
import Circle from "@mui/icons-material/Circle";
import Link from "@mui/icons-material/Link";
import ArrowRight from "@mui/icons-material/ArrowRight";
import { TEAM_COLORS, type TeamKey } from "./initiative";
import { LinkParentDialog } from "./LinkParentDialog";

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDelete: () => void;
  onReset: () => void;
  onEdit: () => void;
  /** Current team tag */
  team?: TeamKey;
  /** Called when team changes */
  onTeamChange?: (team: TeamKey | undefined) => void;
  /** Available parents for linking as pet */
  availableParents?: Array<{ id: string; name: string; imageUrl?: string }>;
  /** Called when linking to a parent */
  onLink?: (parentId: string) => void;
}

const TEAM_OPTIONS: Array<{ key: TeamKey; label: string }> = [
  { key: "ally", label: "Aliado" },
  { key: "enemy", label: "Enemigo" },
  { key: "neutral", label: "Neutral" },
];

export function CharacterMenu({
  anchorEl,
  onClose,
  onDelete,
  onReset,
  onEdit,
  team,
  onTeamChange,
  availableParents,
  onLink,
}: Props) {
  const [teamAnchor, setTeamAnchor] = useState<HTMLElement | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);

  return (
    <>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
        <MenuItem
          onClick={() => {
            onEdit();
            onClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Editar recursos" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onReset();
            onClose();
          }}
        >
          <ListItemIcon>
            <Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Reiniciar recursos" />
        </MenuItem>

        {/* Team submenu trigger */}
        {onTeamChange && (
          <MenuItem onClick={(e) => setTeamAnchor(e.currentTarget)}>
            <ListItemIcon>
              <Circle
                sx={{
                  fontSize: 14,
                  color: team ? TEAM_COLORS[team] : "text.disabled",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Equipo" />
            <ArrowRight sx={{ fontSize: 18, color: "text.secondary", ml: 1 }} />
          </MenuItem>
        )}

        {/* Link as pet */}
        {onLink && availableParents && availableParents.length > 0 && (
          <MenuItem
            onClick={() => {
              setLinkOpen(true);
              onClose();
            }}
          >
            <ListItemIcon>
              <Link fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Vincular a..." />
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            onDelete();
            onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Eliminar de la iniciativa" />
        </MenuItem>
      </Menu>

      {/* Team submenu */}
      <Menu
        anchorEl={teamAnchor}
        open={Boolean(teamAnchor)}
        onClose={() => setTeamAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {TEAM_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.key}
            selected={team === opt.key}
            onClick={() => {
              onTeamChange?.(opt.key);
              setTeamAnchor(null);
              onClose();
            }}
          >
            <ListItemIcon>
              <Circle sx={{ fontSize: 12, color: TEAM_COLORS[opt.key] }} />
            </ListItemIcon>
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => {
            onTeamChange?.(undefined);
            setTeamAnchor(null);
            onClose();
          }}
        >
          <ListItemIcon>
            <Circle sx={{ fontSize: 12, color: "text.disabled" }} />
          </ListItemIcon>
          <ListItemText primary="Ninguno" />
        </MenuItem>
      </Menu>

      {/* Link parent dialog */}
      {onLink && (
        <LinkParentDialog
          open={linkOpen}
          candidates={availableParents ?? []}
          onClose={() => setLinkOpen(false)}
          onSelect={(parentId) => {
            onLink(parentId);
            setLinkOpen(false);
          }}
        />
      )}
    </>
  );
}
