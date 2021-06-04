export interface ISchema {
  version: number;
  structure: {
    indexName: string;
    keyPath: string;
    options?: IDBIndexParameters;
  };
}
export class IndexDBService {
  private instance: IDBDatabase | undefined;
  private dbName: string;
  private storeName: string;
  private versionNumber: number = 1;
  private schema: Array<ISchema>;

  constructor(databaseName: string, storeName: string, schema: Array<ISchema>) {
    this.dbName = databaseName;
    this.storeName = storeName;
    this.schema = schema;
    this.versionNumber = this.schema[this.schema.length - 1].version;
    if (!window.indexedDB) {
      console.error(
        "Your browser doesn't support a stable version of IndexedDB"
      );
    }
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
            const version = e.oldVersion;
            let objectStore: IDBObjectStore;
            if (db.oldVersion === 0) {
              objectStore = db.createObjectStore(this.storeName);
            } else {
              objectStore = e.target.transaction.objectStore(this.storeName);
            }

            this.schema.forEach((schemaVersion) => {
              if (version - 1 === schemaVersion.version) {
                // Add the fields
                objectStore.createIndex(
                  schemaVersion.structure.indexName,
                  schemaVersion.structure.keyPath,
                  schemaVersion.structure.options
                );
              }
            });
          };
        }
      } catch (e) {
        reject(`No support for IndexedDB - ${e.message}`);
      }
    });
  }

  public checkInstance() {
    return !!this.instance;
  }
  public getDataAllFromStore<T>(): Promise<Array<T>> {
    return new Promise((res, rej) => {
      if (!this.instance) {
        return rej("No instance");
      }
      try {
        const req = this.getObjectStoreReadWrite().openCursor();
        if (!req) {
          return rej("Request failed");
        }

        let data: any = [];
        req.onsuccess = (event: any) => {
          let cursor = event.target.result;
          if (cursor) {
            data.push({ ...cursor.value, key: cursor.primaryKey });
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

  public getItemByIdFrom<T>(id: string): Promise<T> {
    return new Promise((res, rej) => {
      if (!this.instance) {
        return rej("No instance");
      }
      try {
        const req = this.getObjectStoreReadWrite()?.get(id);
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

  public removeItemById(id: string) {
    return new Promise((res, rej) => {
      if (!this.instance) {
        return rej("No instance");
      }
      try {
        const req = this.getObjectStoreReadWrite()?.delete(id);
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
      try {
        const req = this.getObjectStoreReadWrite().add(data, id);
        if (!req) {
          rej("Request failed");
        }
        req.onsuccess = (data) => {
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

  private getObjectStoreReadWrite() {
    if (!this.instance) {
      console.error("No DB instance");
      throw new Error("No DB instance");
    }
    const transaction = this.instance.transaction(
      [this.storeName],
      "readwrite"
    );
    return transaction.objectStore(this.storeName);
  }
}
