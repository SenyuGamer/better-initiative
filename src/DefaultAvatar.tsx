import Avatar from "@mui/material/Avatar";

interface Props {
  name: string;
  disabled?: boolean;
}

export function DefaultAvatar({ name, disabled }: Props) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Avatar
      sx={{
        width: 30,
        height: 30,
        bgcolor: disabled ? "action.selected" : "primary.main",
        color: "background.paper",
        fontSize: 11,
        fontWeight: 700,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {initials}
    </Avatar>
  );
}
