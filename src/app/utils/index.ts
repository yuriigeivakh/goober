'use client'
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'goober';
const STORE_NAME = 'currentUser';

// Define a database schema
interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: {
      id: string;
      name: string;
      role: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export const setIndexedDBUser = async (user: { id: string; name: string; role: string }) => {
  if (typeof window === 'undefined' || !dbPromise) return;

  try {
    const db = await dbPromise;
    await db.put(STORE_NAME, user, 'currentUser');
    window.dispatchEvent(new Event('userLoggedIn'));
  } catch (err) {
    console.warn('openDB issue', err);
  }
};

export const getIndexedDBUser = async () => {
  if (typeof window === 'undefined' || !dbPromise) return null;

  try {
    const db = await dbPromise;
    return await db.get(STORE_NAME, 'currentUser');
  } catch (err) {
    console.warn('openDB issue', err);
  }
};

export const deleteIndexedDBUser = async () => {
  if (typeof window === 'undefined' || !dbPromise) return;

  try {
    const db = await dbPromise;
    await db.delete(STORE_NAME, 'currentUser');
  } catch (err) {
    console.warn('openDB issue', err);
  }
};

const BASE_FARE = 100;
const DISTANCE_RATE = 80;
const TIME_RATE = 15;

export function getPrice(distance: number, time: number): number {
  const amount = BASE_FARE + DISTANCE_RATE * distance + TIME_RATE * time;
  return amount / 100;
}
