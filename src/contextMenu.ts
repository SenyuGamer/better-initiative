import OBR from "@owlbear-rodeo/sdk";
import type { KeyFilter } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./plugin/getPluginId";
import { createInitiativeData, getMetadataKey } from "./initiative";

import addIcon from "./assets/add.svg";
import removeIcon from "./assets/remove.svg";

const MENU_ID = getPluginId("menu/toggle");

/** every: ALL selected items must pass every condition.
 *  coordinator "||" makes the layer conditions an OR chain:
 *  (layer == CHARACTER || layer == MOUNT || layer == PROP) && type == IMAGE
 */
function buildFilter(withMetadataCheck = true): {
  every: KeyFilter[];
  permissions: ("UPDATE")[];
} {
  const every: KeyFilter[] = [
    { key: "layer", value: "CHARACTER", coordinator: "||" },
    { key: "layer", value: "MOUNT", coordinator: "||" },
    { key: "layer", value: "PROP" },
    { key: "type", value: "IMAGE" },
  ];
  if (withMetadataCheck) {
    every.push({ key: ["metadata", getMetadataKey()], value: undefined });
  }
  return {
    every,
    permissions: ["UPDATE"] as ("UPDATE")[],
  };
}

export function setupContextMenu() {
  OBR.contextMenu.create({
    id: MENU_ID,
    icons: [
      {
        icon: addIcon,
        label: "Add to Initiative",
        filter: buildFilter(true),
      },
      {
        icon: removeIcon,
        label: "Remove from Initiative",
        filter: buildFilter(false),
      },
    ],
    onClick(context) {
      const addToInitiative = context.items.every(
        (item) => item.metadata[getMetadataKey()] === undefined
      );

      if (addToInitiative) {
        OBR.scene.items.updateItems(context.items, (items) => {
          for (const item of items) {
            item.metadata[getMetadataKey()] = createInitiativeData(0);
          }
        });
      } else {
        OBR.scene.items.updateItems(context.items, (items) => {
          for (const item of items) {
            delete item.metadata[getMetadataKey()];
          }
        });
      }
    },
  });
}