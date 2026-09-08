import OBR from "@owlbear-rodeo/sdk";
import type { Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./plugin/getPluginId";

export type ResourceKey = "action" | "bonus" | "reaction";

export interface InitiativeData {
  /** Initiative value (higher goes first) */
  initiative: number;
  /** Whether this creature currently has the turn */
  activeTurn: boolean;
  /** Max values (editable, e.g. double/triple action) */
  maxAction: number;
  maxBonus: number;
  maxReaction: number;
  /** Current remaining values */
  action: number;
  bonus: number;
  reaction: number;
}

export function getMetadataKey() {
  return getPluginId("metadata");
}

export function hasInitiative(item: Item): boolean {
  return item.metadata[getMetadataKey()] !== undefined;
}

export function getInitiative(item: Item): InitiativeData | undefined {
  return item.metadata[getMetadataKey()] as InitiativeData | undefined;
}

export function parseInitiative(raw: unknown): InitiativeData | undefined {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return obj.initiative !== undefined
      ? (obj as unknown as InitiativeData)
      : undefined;
  }
  return undefined;
}

/** Resources that are usable by D&D-ish creatures */
export const RESOURCES: { key: ResourceKey; label: string }[] = [
  { key: "action", label: "Acción" },
  { key: "bonus", label: "Bonus" },
  { key: "reaction", label: "Reacción" },
];

export function allResourcesSpent(data: InitiativeData): boolean {
  return data.action <= 0 && data.bonus <= 0 && data.reaction <= 0;
}

/** Create the default metadata for a creature */
export function createInitiativeData(
  initiative: number,
  activeTurn = false
): InitiativeData {
  return {
    initiative,
    activeTurn,
    maxAction: 1,
    maxBonus: 1,
    maxReaction: 1,
    action: 1,
    bonus: 1,
    reaction: 1,
  };
}

export function resetResources(data: InitiativeData): InitiativeData {
  return {
    ...data,
    action: data.maxAction,
    bonus: data.maxBonus,
    reaction: data.maxReaction,
  };
}

/** Decrement a resource for the given item ids, clamped at 0 */
export async function decrementResource(ids: string[], key: ResourceKey) {
  await OBR.scene.items.updateItems(ids, (items) => {
    for (const item of items) {
      const current = getInitiative(item);
      if (current) {
        item.metadata[getMetadataKey()] = {
          ...current,
          [key]: Math.max(0, current[key] - 1),
        };
      }
    }
  });
}

/** Update the metadata of the given items with the provided partial data */
export async function updateInitiative(
  ids: string[],
  update: (data: InitiativeData) => InitiativeData
) {
  await OBR.scene.items.updateItems(ids, (items) => {
    for (const item of items) {
      const current = getInitiative(item);
      if (current) {
        item.metadata[getMetadataKey()] = update(current);
      }
    }
  });
}
