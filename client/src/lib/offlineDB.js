import { openDB } from "idb";

const dbPromise = openDB("complaint-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("complaints")) {
      db.createObjectStore("complaints", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});

export async function saveComplaintOffline(complaint) {
  const db = await dbPromise;
  // Add a tempId and syncStatus for tracking
  const tempId = `offline-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const offlineComplaint = {
    ...complaint,
    tempId,
    syncStatus: "pending",
  };
  await db.add("complaints", offlineComplaint);
  return offlineComplaint;
}

export async function getOfflineComplaints() {
  const db = await dbPromise;
  return await db.getAll("complaints");
}

export async function clearOfflineComplaints() {
  const db = await dbPromise;
  await db.clear("complaints");
}
