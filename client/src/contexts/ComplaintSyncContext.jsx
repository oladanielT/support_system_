import { createContext, useContext, useState, useCallback } from "react";

const ComplaintSyncContext = createContext();

export function ComplaintSyncProvider({ children }) {
  const [syncingIds, setSyncingIds] = useState([]); // array of offline complaint temp ids

  const markSyncing = useCallback((id) => {
    setSyncingIds((prev) => [...prev, id]);
  }, []);

  const unmarkSyncing = useCallback((id) => {
    setSyncingIds((prev) => prev.filter((x) => x !== id));
  }, []);

  return (
    <ComplaintSyncContext.Provider
      value={{ syncingIds, markSyncing, unmarkSyncing }}
    >
      {children}
    </ComplaintSyncContext.Provider>
  );
}

export function useComplaintSync() {
  return useContext(ComplaintSyncContext);
}
