export interface ISchema {
  version: number;
  storeName: string;
  indexes: Array<{
    indexName: string;
    keyPath: string;
    options?: IDBIndexParameters;
  }>;
}

export class IndexDBStore {
  private store: IDBObjectStore | undefined;
  constructor(store: IDBObjectStore) {
    this.store = store;
  }

  public getAllDataFromStore<T>(): Promise<Array<{ key: string; data: T }>> {
    return new Promise((res, rej) => {
      if (!this.store) {
        return rej("No store");
      }
      try {
        const req = this.store.openCursor();
        if (!req) {
          return rej("Request failed");
        }

        let data: Array<{ key: string; data: T }> = [];
        req.onsuccess = (event: any) => {
          let cursor = event.target.result;
          if (cursor) {
            data.push({ key: cursor.primaryKey, data: cursor.value });
            cursor.continue();
          } else {
            res(data);
          }
        };
        req.onerror = (error: any) => {
          return rej(error.target.error);
        };
      } catch (e) {
        return rej(e.reason);
      }
    });
  }

  public getDataUsingIndexByKey<T>(
    indexName: string,
    key: string
  ): Promise<Array<{ key: string; data: T }>> {
    return new Promise((res, rej) => {
      if (!this.store) {
        return rej("No store");
      }
      try {
        const indexInstance = this.store.index(indexName);

        let data: Array<{ key: string; data: T }> = [];
        const indexCursor = indexInstance.get(key);

        indexCursor.onsuccess = (event: any) => {
          let cursor = event.target.result;
          if (cursor) {
            data.push({ key: cursor.primaryKey, data: cursor.value });
            cursor.continue();
          } else {
            res(data);
          }
        };
        indexCursor.onerror = (error: any) => {
          return rej(error.target.error);
        };
      } catch (e) {
        return rej(e.reason);
      }
    });
  }

  public getItemById<T>(id: string): Promise<{ key: string; data: T }> {
    return new Promise((res, rej) => {
      if (!this.store) {
        return rej("No store");
      }
      try {
        const req = this.store?.get(id);
        if (!req) {
          rej("Request failed");
        }

        req.onsuccess = (data: any) => {
          const result = { key: id, data: data.target.result };
          res(result);
        };
        req.onerror = (error: any) => {
          rej(error.target.error);
        };
      } catch (e) {
        rej(e.reason);
      }
    });
  }
  public updateItemById<T>(id: string, item: T): Promise<Boolean> {
    return new Promise((res, rej) => {
      if (!this.store) {
        return rej("No store");
      }
      try {
        const req = this.store?.put(item, id);
        if (!req) {
          rej("Request failed");
        }
        req.onsuccess = (data: any) => {
          res(true);
        };
        req.onerror = (error: any) => {
          rej(error.target.error);
        };
      } catch (e) {
        rej(e.reason);
      }
    });
  }

  public removeItemById(id: string) {
    return new Promise((res, rej) => {
      if (!this.store) {
        return rej("No store");
      }
      try {
        const req = this.store?.delete(id);
        if (!req) {
          rej("Request failed");
        }
        req.onsuccess = (data: any) => {
          res(data.target.result);
        };
        req.onerror = (error: any) => {
          rej(error.target.error);
        };
      } catch (e) {
        rej(e.reason);
      }
    });
  }

  public add<T>(id: string, data: T): Promise<boolean> {
    return new Promise((res, rej) => {
      if (!this.store) {
        return rej("No store");
      }
      try {
        const req = this.store.add(data, id);
        if (!req) {
          rej("Request failed");
        }
        req.onsuccess = (_data) => {
          res(true);
        };
        req.onerror = (error: any) => {
          rej(error.target.error);
        };
      } catch (e) {
        rej(e);
      }
    });
  }
}
export class IndexDBService {
  private static self: IndexDBService | undefined;
  private instance: IDBDatabase | undefined;
  private dbName: string;
  private storeNames: string[] = [];
  private versionNumber: number = 1;
  private schemas: Array<ISchema> = [];
  private indexes: Array<{ name: string; index: IDBIndex }> = [];

  constructor(databaseName: string) {
    if (!window.indexedDB) {
      console.error(
        "Your browser doesn't support a stable version of IndexedDB"
      );
      throw new Error("No IndexedDB support");
    }
    this.dbName = databaseName;
  }

  static get(databaseName: string) {
    if (!IndexDBService.self) {
      IndexDBService.self = new IndexDBService(databaseName);
    }

    return IndexDBService.self;
  }

  public addStore(schema: ISchema) {
    this.schemas.push(schema);
  }

  public async initailise(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const req = window.indexedDB.open(this.dbName, this.versionNumber);
        if (req) {
          req.onsuccess = (e: any) => {
            if (e.target) {
              this.instance = e.target.result;
              resolve();
            } else {
              reject("No instance found");
            }
          };
          req.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            for (const schema of this.schemas) {
              if (!db.objectStoreNames.contains(schema.storeName)) {
                const objectStore = db.createObjectStore(schema.storeName);
                if (schema.indexes.length > 0) {
                  for (const index of schema.indexes) {
                    objectStore.createIndex(
                      index.indexName,
                      index.keyPath,
                      index.options
                    );
                  }
                }
                if (this.versionNumber < schema.version) {
                  this.versionNumber = schema.version;
                }
              }
            }
          };
        }
      } catch (e) {
        reject(`No support for IndexedDB - ${e.message}`);
      }
    });
  }

  public getStore(storeName: string) {
    if (!this.instance) {
      console.error("No DB instance");
      throw new Error("No DB instance");
    }
    const transaction = this.instance.transaction([storeName], "readwrite");
    transaction.oncomplete = (ev) => {
      this.instance?.close();
    };
    return new IndexDBStore(transaction.objectStore(storeName));
  }
}
