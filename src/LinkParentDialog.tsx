import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface Candidate {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Props {
  open: boolean;
  candidates: Candidate[];
  onClose: () => void;
  onSelect: (parentId: string) => void;
}

export function LinkParentDialog({ open, candidates, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Vincular a...</DialogTitle>
      
      {candidates.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No hay personajes disponibles
          </Typography>
        </Box>
      ) : (
        <List sx={{ pt: 0 }}>
          {candidates.map((candidate) => {
            const initials = candidate.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("");

            return (
              <ListItemButton
                key={candidate.id}
                onClick={() => {
                  onSelect(candidate.id);
                  onClose();
                }}
              >
                <ListItemAvatar>
                  {candidate.imageUrl ? (
                    <Avatar src={candidate.imageUrl} sx={{ width: 32, height: 32 }}>
                      {initials}
                    </Avatar>
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                      {initials}
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText primary={candidate.name} />
              </ListItemButton>
            );
          })}
        </List>
      )}
    </Dialog>
  );
}
