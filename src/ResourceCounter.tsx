import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface Props {
  label: string;
  icon: ReactNode;
  value: number;
  max: number;
  onClick: () => void;
}

export function ResourceCounter({ label, icon, value, max, onClick }: Props) {
  const theme = useTheme();
  const spent = value <= 0;

  return (
    <Tooltip title={label} placement="top">
      <IconButton
        onClick={onClick}
        size="small"
        disabled={spent}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.25,
          width: 34,
          height: 34,
          borderRadius: "6px",
          border: `1px solid ${
            spent
              ? theme.palette.divider
              : theme.palette.primary.main
          }`,
          bgcolor: spent
            ? "action.disabledBackground"
            : "action.hover",
          color: spent ? "text.disabled" : "primary.main",
          p: 0.25,
          "&:hover": {
            bgcolor: spent ? "action.disabledBackground" : "primary.main",
            color: "background.paper",
            ".counter-value": { color: "background.paper" },
          },
        }}
      >
        <Box sx={{ display: "flex", fontSize: 13, lineHeight: 1 }}>{icon}</Box>
        <Typography
          className="counter-value"
          component="span"
          variant="caption"
          sx={{
            fontSize: 9,
            lineHeight: 1,
            fontWeight: 700,
            color: spent ? "text.disabled" : "inherit",
          }}
        >
          {value}/{max}
        </Typography>
      </IconButton>
    </Tooltip>
  );
}