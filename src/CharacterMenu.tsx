import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Refresh from "@mui/icons-material/Refresh";
import Edit from "@mui/icons-material/Edit";

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDelete: () => void;
  onReset: () => void;
  onEdit: () => void;
}

export function CharacterMenu({
  anchorEl,
  onClose,
  onDelete,
  onReset,
  onEdit,
}: Props) {
  return (
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
  );
}
