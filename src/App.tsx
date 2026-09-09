import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { InitiativeList } from "./InitiativeList";

export function App() {
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    OBR.scene.isReady().then(setSceneReady);
    return OBR.scene.onReadyChange(setSceneReady);
  }, []);

  useEffect(() => {
    if (sceneReady) {
      setupContextMenu();
    }
  }, [sceneReady]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        px: 1.5,
        py: 1,
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        zoom: 0.9,
      }}
    >
      <InitiativeList />
    </Paper>
  );
}