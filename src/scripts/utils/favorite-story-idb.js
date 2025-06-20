import { openDB } from 'idb';

const DB_NAME = 'story-favorite-db';
const STORE_NAME = 'stories';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      // Membuat object store baru dengan keyPath 'id'
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

const FavoriteStoryIdb = {
  async getAll() {
    // Ambil semua data cerita favorit
    return (await dbPromise).getAll(STORE_NAME);
  },

  async get(id) {
    // Ambil cerita favorit berdasarkan id
    return (await dbPromise).get(STORE_NAME, id);
  },

  async put(story) {
    // Simpan cerita favorit, jika sudah ada akan diupdate
    return (await dbPromise).put(STORE_NAME, story);
  },

  async delete(id) {
    // Hapus cerita favorit berdasarkan id
    return (await dbPromise).delete(STORE_NAME, id);
  },
};

export default FavoriteStoryIdb;
