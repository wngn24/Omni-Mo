import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbName = 'PersonalOS_DB';
  private dbVersion = 5;
  
  isReady = signal<boolean>(false);

  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Database error:', event);
        reject('Database failed to open');
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.isReady.set(true);
        console.log('Database initialized successfully');
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        
        const createStore = (name: string, options: IDBObjectStoreParameters = { keyPath: 'id', autoIncrement: true }) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, options);
          }
        };

        createStore('tasks');
        createStore('habits');
        createStore('notes');
        createStore('time_sessions');
        
        if (!db.objectStoreNames.contains('days')) {
          const dayStore = db.createObjectStore('days', { keyPath: 'id', autoIncrement: true });
          dayStore.createIndex('date', 'date', { unique: true });
        }

        if (transaction) {
          const taskStore = transaction.objectStore('tasks');
          if (!taskStore.indexNames.contains('scheduledDate')) {
            taskStore.createIndex('scheduledDate', 'scheduledDate', { unique: false });
          }

          const sessionStore = transaction.objectStore('time_sessions');
          if (!sessionStore.indexNames.contains('startTime')) {
            sessionStore.createIndex('startTime', 'startTime', { unique: false });
          }

          const noteStore = transaction.objectStore('notes');
          if (!noteStore.indexNames.contains('updatedAt')) {
            noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        }
      };
    });
  }

  // Generic CRUD Helpers

  async getAll<T>(storeName: string): Promise<T[]> {
    return this.runTransaction(storeName, 'readonly', store => store.getAll());
  }

  async get<T>(storeName: string, id: number): Promise<T | undefined> {
    return this.runTransaction(storeName, 'readonly', store => store.get(id));
  }

  async add<T>(storeName: string, item: T): Promise<number> {
    return this.runTransaction(storeName, 'readwrite', store => store.add(item));
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    return this.runTransaction(storeName, 'readwrite', store => store.put(item));
  }

  async delete(storeName: string, id: number): Promise<void> {
    return this.runTransaction(storeName, 'readwrite', store => store.delete(id));
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    return this.runTransaction(storeName, 'readonly', store => {
      const index = store.index(indexName);
      return index.getAll(value);
    });
  }

  async getByRange<T>(storeName: string, indexName: string, range: IDBKeyRange): Promise<T[]> {
    return this.runTransaction(storeName, 'readonly', store => {
      const index = store.index(indexName);
      return index.getAll(range);
    });
  }

  // Private Helper
  private async runTransaction<T>(
    storeName: string, 
    mode: IDBTransactionMode, 
    operation: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    const db = await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      try {
        request = operation(store);
      } catch (e) {
        return reject(e);
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}