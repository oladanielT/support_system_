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
  await db.add("complaints", complaint);
}

export async function getOfflineComplaints() {
  const db = await dbPromise;
  return await db.getAll("complaints");
}

export async function clearOfflineComplaints() {
  const db = await dbPromise;
  await db.clear("complaints");
}
