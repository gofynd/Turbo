import { useState, useEffect } from "react";

export const useSyncedState = (parent) => {
  const [syncedState, setSyncedState] = useState(parent);

  useEffect(() => {
    setSyncedState(parent);
  }, [parent]);

  return [syncedState, setSyncedState];
};
