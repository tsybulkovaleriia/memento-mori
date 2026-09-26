import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { Place } from "@memento-mori/types";

export interface CollectionItem {
  place: Place;
  note?: string;
  addedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
}

interface CollectionsStore {
  collections: Collection[];
  activeCollectionId: string | null;
  drawerOpen: boolean;

  createCollection: (name: string, description?: string) => Collection;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addToCollection: (collectionId: string, place: Place, note?: string) => void;
  removeFromCollection: (collectionId: string, placeId: string) => void;
  updateNote: (collectionId: string, placeId: string, note: string) => void;
  cloneCollection: (source: Collection) => Collection;

  setActiveCollection: (id: string | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

function generateId(): string {
  return Crypto.randomUUID();
}

export const useCollectionsStore = create<CollectionsStore>()(
  persist(
    (set, get) => ({
      collections: [],
      activeCollectionId: null,
      drawerOpen: false,

      createCollection: (name, description) => {
        const collection: Collection = {
          id: generateId(),
          name,
          description,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ collections: [...s.collections, collection] }));
        return collection;
      },

      deleteCollection: (id) => {
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
          activeCollectionId:
            s.activeCollectionId === id ? null : s.activeCollectionId,
        }));
      },

      renameCollection: (id, name) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, name, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      addToCollection: (collectionId, place, note) => {
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c;
            const exists = c.items.some((i) => i.place.id === place.id);
            if (exists) return c;
            return {
              ...c,
              updatedAt: new Date().toISOString(),
              items: [
                ...c.items,
                { place, note, addedAt: new Date().toISOString() },
              ],
            };
          }),
        }));
      },

      removeFromCollection: (collectionId, placeId) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  items: c.items.filter((i) => i.place.id !== placeId),
                }
              : c
          ),
        }));
      },

      updateNote: (collectionId, placeId, note) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  items: c.items.map((i) =>
                    i.place.id === placeId ? { ...i, note } : i
                  ),
                }
              : c
          ),
        }));
      },

      cloneCollection: (source) => {
        const cloned: Collection = {
          ...source,
          id: generateId(),
          name: `${source.name} (copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ collections: [...s.collections, cloned] }));
        return cloned;
      },

      setActiveCollection: (id) => set({ activeCollectionId: id }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "memento-mori-collections",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ collections, activeCollectionId }) => ({
        collections,
        activeCollectionId,
      }),
    }
  )
);
