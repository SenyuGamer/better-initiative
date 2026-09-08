import OBR from "@owlbear-rodeo/sdk";
import React, { useEffect, useState } from "react";

/** Only render the children when we're within a plugin and it's ready */
export function PluginGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (OBR.isAvailable) {
      OBR.onReady(() => setReady(true));
    }
  }, []);

  return ready ? <>{children}</> : null;
}
