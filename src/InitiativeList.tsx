import { useEffect, useMemo, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import SkipNext from "@mui/icons-material/SkipNext";
import Group from "@mui/icons-material/Group";
import EmptyState from "@mui/icons-material/PriorityHigh";
import OBR from "@owlbear-rodeo/sdk";
import type { Image, Item, Metadata } from "@owlbear-rodeo/sdk";
import {
  getInitiative,
  getMetadataKey,
  getSceneMetadataKey,
  hasInitiative,
  isPet,
  resetResources,
  updateInitiative,
  getRound,
  setRound,
  type InitiativeData,
  type SceneData,
} from "./initiative";
import { CharacterRow } from "./CharacterRow";
import { PetRow } from "./PetRow";

interface OrderedItem {
  item: Item;
  data: InitiativeData;
}

export function InitiativeList() {
  const [items, setItems] = useState<Item[]>([]);
  const [round, setRoundState] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Subscribe to scene items
  useEffect(() => {
    const load = () => OBR.scene.items.getItems().then(setItems);
    load();
    return OBR.scene.items.onChange(setItems);
  }, []);

  // Subscribe to scene metadata (round)
  useEffect(() => {
    getRound().then(setRoundState);
    return OBR.scene.onMetadataChange((meta: Metadata) => {
      const scene = meta[getSceneMetadataKey()] as SceneData | undefined;
      setRoundState(scene?.round ?? 1);
    });
  }, []);

  // All items with initiative data
  const allEntries: OrderedItem[] = useMemo(() => {
    return items
      .filter(hasInitiative)
      .map((item) => ({ item, data: getInitiative(item)! }))
      .filter((entry): entry is OrderedItem => entry.data !== undefined);
  }, [items]);

  // Main characters (non-pets), sorted by initiative
  const owners: OrderedItem[] = useMemo(() => {
    return allEntries
      .filter((e) => !isPet(e.data))
      .sort((a, b) => b.data.initiative - a.data.initiative);
  }, [allEntries]);

  // Pets grouped by parentId
  const petsByParent: Map<string, OrderedItem[]> = useMemo(() => {
    const map = new Map<string, OrderedItem[]>();
    for (const entry of allEntries) {
      if (entry.data.parentId) {
        const list = map.get(entry.data.parentId) ?? [];
        list.push(entry);
        map.set(entry.data.parentId, list);
      }
    }
    return map;
  }, [allEntries]);

  const activeIndex = useMemo(
    () => owners.findIndex((entry) => entry.data.activeTurn),
    [owners]
  );

  // Auto-expand/collapse based on active turn
  useEffect(() => {
    if (activeIndex < 0) return;
    const activeOwnerId = owners[activeIndex].item.id;
    setExpandedGroups((prev) => {
      const next = new Set<string>();
      // Keep manually expanded groups, plus auto-expand active
      for (const id of prev) {
        // Collapse groups whose turn has passed (not active)
        if (id === activeOwnerId) {
          next.add(id);
        }
      }
      // Always expand the active owner if they have pets
      if (petsByParent.has(activeOwnerId)) {
        next.add(activeOwnerId);
      }
      return next;
    });
  }, [activeIndex, owners, petsByParent]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleNextTurn = () => {
    if (owners.length === 0) return;
    const nextIndex = (activeIndex + 1) % owners.length;
    const nextId = owners[nextIndex].item.id;

    // Auto-increment round when cycling back to first character
    if (nextIndex === 0 && activeIndex >= 0) {
      setRoundState((prev) => {
        const nextRound = prev + 1;
        setRound(nextRound);
        return nextRound;
      });
    }

    // Collect all IDs to update: owners + their pets (for reset)
    const nextPets = petsByParent.get(nextId) ?? [];
    const allIds = [
      ...owners.map((e) => e.item.id),
      ...nextPets.map((e) => e.item.id),
    ];

    OBR.scene.items.updateItems(allIds, (draft) => {
      for (const d of draft) {
        const current = getInitiative(d);
        if (!current) continue;

        if (d.id === nextId) {
          // Activate and reset owner
          d.metadata[getMetadataKey()] = {
            ...resetResources(current),
            activeTurn: true,
          };
        } else if (nextPets.some((p) => p.item.id === d.id)) {
          // Reset pets of the next active owner
          d.metadata[getMetadataKey()] = resetResources(current);
        } else if (current.activeTurn) {
          // Deactivate previous owner
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

  const handleUnlink = (id: string) => {
    updateInitiative([id], (current) => {
      const { parentId: _, ...rest } = current;
      return rest as InitiativeData;
    });
  };

  const handleLink = (petId: string, parentId: string) => {
    updateInitiative([petId], (current) => ({
      ...current,
      parentId,
    }));
  };

  // Build available parents list for the "Vincular a..." dialog
  const availableParents = useMemo(() => {
    return owners.map((e) => ({
      id: e.item.id,
      name: e.item.name,
      imageUrl: (e.item as Image).image?.url,
    }));
  }, [owners]);

  const handleRoundChange = (value: string) => {
    const parsed = parseInt(value, 10);
    const newRound = Number.isNaN(parsed) || parsed < 1 ? 1 : Math.floor(parsed);
    setRoundState(newRound);
    setRound(newRound);
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0.75,
          py: 0.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Group color="primary" sx={{ fontSize: 18 }} />
          <Typography
            variant="h6"
            sx={{ fontSize: "0.975rem", fontWeight: 700, lineHeight: "28px" }}
          >
            Iniciativa
          </Typography>
          {owners.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
              >
                · Ronda
              </Typography>
              <Input
                type="number"
                disableUnderline
                sx={{ width: 28 }}
                inputProps={{
                  sx: {
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 0,
                    px: 0,
                  },
                }}
                value={round}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleRoundChange(e.target.value)}
              />
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          size="small"
          endIcon={<SkipNext sx={{ fontSize: 18 }} />}
          disabled={owners.length === 0}
          onClick={handleNextTurn}
          sx={{ whiteSpace: "nowrap", minWidth: "auto", px: 1.5 }}
        >
          Siguiente
        </Button>
      </Box>

      {/* List */}
      {owners.length === 0 && allEntries.length === 0 ? (
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
          {owners.map((entry, index) => {
            const pets = petsByParent.get(entry.item.id) ?? [];
            const isExpanded = expandedGroups.has(entry.item.id);

            return (
              <Box key={entry.item.id}>
                <CharacterRow
                  item={entry.item}
                  data={entry.data}
                  active={index === activeIndex}
                  onDelete={() => handleDelete(entry.item.id)}
                  petCount={pets.length}
                  expanded={isExpanded}
                  onToggleExpand={
                    pets.length > 0
                      ? () => toggleExpand(entry.item.id)
                      : undefined
                  }
                  availableParents={availableParents.filter(
                    (p) => p.id !== entry.item.id
                  )}
                  onLink={(parentId) => handleLink(entry.item.id, parentId)}
                />
                {isExpanded &&
                  pets.map((pet) => (
                    <PetRow
                      key={pet.item.id}
                      item={pet.item}
                      data={pet.data}
                      onDelete={() => handleDelete(pet.item.id)}
                      onUnlink={() => handleUnlink(pet.item.id)}
                    />
                  ))}
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
