import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import SkipNext from "@mui/icons-material/SkipNext";
import Group from "@mui/icons-material/Group";
import EmptyState from "@mui/icons-material/PriorityHigh";
import OBR from "@owlbear-rodeo/sdk";
import type { Item } from "@owlbear-rodeo/sdk";
import {
  getInitiative,
  getMetadataKey,
  hasInitiative,
  resetResources,
} from "./initiative";
import { CharacterRow } from "./CharacterRow";

interface OrderedItem {
  item: Item;
  data: ReturnType<typeof getInitiative>;
}

export function InitiativeList() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = () => OBR.scene.items.getItems().then(setItems);
    load();
    return OBR.scene.items.onChange(setItems);
  }, []);

  const ordered: OrderedItem[] = useMemo(() => {
    return items
      .filter(hasInitiative)
      .map((item) => ({ item, data: getInitiative(item) }))
      .filter((entry): entry is OrderedItem => entry.data !== undefined)
      .sort((a, b) => b.data!.initiative - a.data!.initiative);
  }, [items]);

  const activeIndex = useMemo(
    () => ordered.findIndex((entry) => entry.data!.activeTurn),
    [ordered]
  );

  const handleNextTurn = () => {
    if (ordered.length === 0) return;
    const nextIndex = (activeIndex + 1) % ordered.length;
    const nextId = ordered[nextIndex].item.id;

    OBR.scene.items.updateItems(ordered.map((e) => e.item.id), (draft) => {
      for (const entry of ordered) {
        const d = draft.find((it) => it.id === entry.item.id);
        if (!d) continue;
        const current = getInitiative(d);
        if (!current) continue;
        if (d.id === nextId) {
          d.metadata[getMetadataKey()] = {
            ...resetResources(current),
            activeTurn: true,
          };
        } else if (current.activeTurn) {
          d.metadata[getMetadataKey()] = { ...current, activeTurn: false };
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    OBR.scene.items.updateItems([id], (draft) => {
      for (const d of draft) {
        delete d.metadata[getMetadataKey()];
      }
    });
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          py: 0.75,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Group color="primary" sx={{ fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{ fontSize: "1.125rem", fontWeight: 700, lineHeight: "32px" }}
          >
            Iniciativa
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          endIcon={<SkipNext sx={{ fontSize: 18 }} />}
          disabled={ordered.length === 0}
          onClick={handleNextTurn}
        >
          Siguiente turno
        </Button>
      </Box>

      {ordered.length === 0 ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ flex: 1, color: "text.secondary" }}
        >
          <EmptyState fontSize="large" />
          <Typography variant="body2" align="center">
            Haz clic derecho sobre un personaje, montura o prop
            <br />
            y pulsa "Add to Initiative"
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={0.5} sx={{ flex: 1, overflowY: "auto", pr: 0.25 }}>
          {ordered.map((entry, index) => (
            <CharacterRow
              key={entry.item.id}
              item={entry.item}
              data={entry.data!}
              active={index === activeIndex}
              onDelete={() => handleDelete(entry.item.id)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
