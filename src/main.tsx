import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { App } from "./App";
import { PluginThemeProvider } from "./plugin/PluginThemeProvider";
import { PluginGate } from "./plugin/PluginGate";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PluginThemeProvider>
      <CssBaseline />
      <PluginGate>
        <App />
      </PluginGate>
    </PluginThemeProvider>
  </React.StrictMode>
);
