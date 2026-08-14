import { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "atsak:activeProjectId";

type ActiveProjectContextValue = {
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ActiveProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => readStored());

  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
    try {
      if (id) {
        window.localStorage.setItem(STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, []);

  const value = useMemo(() => ({ activeProjectId, setActiveProjectId }), [activeProjectId, setActiveProjectId]);

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject() {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error("useActiveProject must be used within an ActiveProjectProvider");
  return ctx;
}
