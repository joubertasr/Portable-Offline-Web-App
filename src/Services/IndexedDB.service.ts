export class IndexDBService {
  private instance: IDBDatabase | undefined;
  private dbName: string;
  private storeName: string;
  private versionNumber: number = 1;

  constructor(databaseName: string, storeName: string) {
    this.dbName = databaseName;
    this.storeName = storeName;
    if (!window.indexedDB) {
      console.error(
        "Your browser doesn't support a stable version of IndexedDB"
      );
    }
    try {
      const req = window.indexedDB.open(this.dbName, this.versionNumber);
      if (req) {
        req.onsuccess = (e: any) => {
          if (e.target) {
            this.instance = e.target.result;
          }
        };
        req.onupgradeneeded = (e: any) => {
          this.checkForStore(e.target.result);
        };
      }
    } catch (e) {
      throw new Error("No support for IndexedDB");
    }
  }

  public checkForStore(instance: any) {
    if (instance) {
      try {
        this.getObjectStoreReadWrite();
      } catch (e) {
        instance.createObjectStore(this.storeName);
      }
    }
  }

  public checkInstance() {
    return !!this.instance;
  }

  public getDataAllFromStore() {
    return new Promise((res, rej) => {
      if (!this.instance) {
        return rej("No instance");
      }
      try {
        const req = this.getObjectStoreReadWrite().getAll();
        if (!req) {
          return rej("Request failed");
        }
        req.onsuccess = (data: any) => {
          res(data.target.result);
        };
        req.onerror = (error: any) => {
          return rej(error.target.error);
        };
      } catch (e) {
        return rej(e.reason);
      }
    });
  }
  public getItemByIdFromStore(id: string) {
    return new Promise((res, rej) => {
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

  public add(id: string, data: any): Promise<any> {
    return new Promise((res, rej) => {
      try {
        const req = this.getObjectStoreReadWrite()?.add(data, id);
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
