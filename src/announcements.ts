/**
 * Annonces personnalisées par station, enregistrées par l'utilisateur
 * (micro ou fichier audio) et stockées localement dans IndexedDB.
 * Clé : nom de station normalisé, pour être réutilisées d'une course à
 * l'autre (presets, imports BULB-MAX, saisie manuelle).
 */

const DB_NAME = "lumiplan-announcements";
const STORE = "recordings";

export const normalizeStopName = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      }),
  );
}

export const Announcements = {
  async get(stopName: string): Promise<Blob | null> {
    try {
      const result = await withStore("readonly", (s) =>
        s.get(normalizeStopName(stopName)),
      );
      return (result as Blob) ?? null;
    } catch {
      return null;
    }
  },

  async set(stopName: string, audio: Blob): Promise<void> {
    await withStore("readwrite", (s) =>
      s.put(audio, normalizeStopName(stopName)),
    );
  },

  async remove(stopName: string): Promise<void> {
    await withStore("readwrite", (s) =>
      s.delete(normalizeStopName(stopName)),
    );
  },

  async listNames(): Promise<string[]> {
    try {
      const keys = await withStore("readonly", (s) => s.getAllKeys());
      return (keys as IDBValidKey[]).map(String);
    } catch {
      return [];
    }
  },
};
