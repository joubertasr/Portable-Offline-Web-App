export interface IStoreSchema<T> {
  storeName: string;
  indexes: Array<{
    indexName: T;
    keyPath: string;
    options?: IDBIndexParameters;
  }>;
}
export interface ISchema<T> {
  version: number;
  stores: Array<IStoreSchema<T>>;
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

  public getDataUsingIndexByKey<T, R>(
    indexName: T,
    key: string
  ): Promise<Array<R>> {
    return new Promise((res, rej) => {
      if (!this.store) {
        return rej("No store");
      }
      try {
        const indexInstance = this.store.index(indexName as unknown as string);

        const keyRange = IDBKeyRange.only(key);

        let data: Array<R> = [];
        const indexCursor = indexInstance.openCursor(keyRange);
        indexCursor.onsuccess = (event: any) => {
          let cursor = event.target.result;
          if (cursor) {
            data.push({
              key: cursor.primaryKey,
              data: cursor.value,
            } as unknown as R);
            if (cursor.continue) {
              cursor.continue();
            }
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
export class IndexDBService<T> {
  private static self: IndexDBService<any> | undefined;
  private instance: IDBDatabase | undefined;
  private dbName: string;
  private versionNumber: number = 1;
  private schemas: Array<IStoreSchema<T>> = [];

  constructor(databaseName: string) {
    if (!window.indexedDB) {
      console.error(
        "Your browser doesn't support a stable version of IndexedDB"
      );
      throw new Error("No IndexedDB support");
    }
    this.dbName = databaseName;
  }

  static get<T>(databaseName: string) {
    if (!IndexDBService.self) {
      IndexDBService.self = new IndexDBService<T>(databaseName);
    }

    return IndexDBService.self;
  }

  public addSchema(schema: ISchema<T>) {
    schema.stores.forEach((store) => {
      this.schemas.push(store);
    });
  }

  public setVersion(version: number) {
    if (this.versionNumber < version) {
      this.versionNumber = version;
    }
  }

  public async initailise(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const req = window.indexedDB.open(this.dbName, this.versionNumber);
        if (req) {
          req.onerror = (e: any) => {
            console.error("Error", e);
          };
          req.onsuccess = (e: any) => {
            if (e.target) {
              this.instance = e.target.result;
              console.log("Here1", typeof this.instance);
              resolve();
            } else {
              console.log("Here2");
              reject("No instance found");
            }
          };
          req.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            console.log("Schema:::", this.schemas);
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
