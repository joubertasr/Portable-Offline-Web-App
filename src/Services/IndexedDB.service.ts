export class IndexDBService {
  private instance: IDBDatabase | undefined;
  private dbName: string;
  private storeName: string;

  constructor(databaseName: string, storeName: string) {
    this.dbName = databaseName;
    this.storeName = storeName;
    if (!window.indexedDB) {
      console.error(
        "Your browser doesn't support a stable version of IndexedDB"
      );
    }
    try {
      const req = window.indexedDB.open(this.dbName, 1);
      if (req) {
        req.onsuccess = (e: any) => {
          if (e.target) {
            this.instance = e.target.result;
            this.checkForStore();
          }
        };
      }
    } catch (e) {
      throw new Error("No support for IndexedDB");
    }
  }

  public checkForStore() {
    if (this.instance) {
      try {
        this.getObjectStoreReadWrite();
      } catch (e) {
        this.instance.createObjectStore(this.storeName);
      }
    }
  }

  public getDataFromStore(id: string) {
    return new Promise((res, rej) => {
      try {
        const req = this.getObjectStoreReadWrite()?.get(id);
        if (!req) {
          rej("Request failed");
        }
        req.onsuccess = (data) => {
          res(data);
        };
      } catch (e) {
        rej(e.reason);
      }
    });
  }

  private getObjectStoreReadWrite() {
    if (!this.instance) {
      throw new Error("No DB instance");
    }
    const transaction = this.instance.transaction(
      [this.storeName],
      "readwrite"
    );
    return transaction.objectStore(this.storeName);
  }
}
