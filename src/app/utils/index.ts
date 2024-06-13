import { openDB } from 'idb';

const DB_NAME = 'goober';
const STORE_NAME = 'currentUser';

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

export const setIndexedDBUser = async (user: { id: string; name: string; role: string }) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, user, 'currentUser');
  window.dispatchEvent(new Event('userLoggedIn'));
};

export const getIndexedDBUser = async () => {
  const db = await dbPromise;
  return await db.get(STORE_NAME, 'currentUser');
};

export const deleteIndexedDBUser = async () => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, 'currentUser');
};

const BASE_FARE = 100
const DISTANCE_RATE = 80
const TIME_RATE = 15
export function getPrice(distance: number, time: number): number {
  const amount = BASE_FARE + (DISTANCE_RATE * distance) + (TIME_RATE * time)
  return amount / 100
}
