import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import type { InitiativeData } from "./initiative";

interface Props {
  open: boolean;
  data: InitiativeData;
  onClose: () => void;
  onSave: (updated: InitiativeData) => void;
}

export function EditResourcesDialog({ open, data, onClose, onSave }: Props) {
  const [maxAction, setMaxAction] = useState(data.maxAction);
  const [maxBonus, setMaxBonus] = useState(data.maxBonus);
  const [maxReaction, setMaxReaction] = useState(data.maxReaction);

  useEffect(() => {
    if (open) {
      setMaxAction(data.maxAction);
      setMaxBonus(data.maxBonus);
      setMaxReaction(data.maxReaction);
    }
  }, [open, data]);

  const clamp = (value: number) =>
    Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;

  const handleSave = () => {
    const newMaxAction = clamp(maxAction);
    const newMaxBonus = clamp(maxBonus);
    const newMaxReaction = clamp(maxReaction);
    onSave({
      ...data,
      maxAction: newMaxAction,
      maxBonus: newMaxBonus,
      maxReaction: newMaxReaction,
      action: newMaxAction !== data.maxAction ? newMaxAction : data.action,
      bonus: newMaxBonus !== data.maxBonus ? newMaxBonus : data.bonus,
      reaction:
        newMaxReaction !== data.maxReaction ? newMaxReaction : data.reaction,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar recursos</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Máximo de acciones"
            type="number"
            inputProps={{ min: 1 }}
            value={maxAction}
            onChange={(e) => setMaxAction(parseInt(e.target.value, 10))}
            fullWidth
          />
          <TextField
            label="Máximo de bonus"
            type="number"
            inputProps={{ min: 1 }}
            value={maxBonus}
            onChange={(e) => setMaxBonus(parseInt(e.target.value, 10))}
            fullWidth
          />
          <TextField
            label="Máximo de reacciones"
            type="number"
            inputProps={{ min: 1 }}
            value={maxReaction}
            onChange={(e) => setMaxReaction(parseInt(e.target.value, 10))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
