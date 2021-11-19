import { v4 as uuidv4 } from "uuid";
import { IndexDBService, IndexDBStore } from "../Services/IndexedDB.service";

export class CollectionHelper<T> {
  dbService: IndexDBService<T> | undefined;
  storeName: string;
  store: IndexDBStore | undefined;
  constructor(iDB: IndexDBService<T>, collectionName: string) {
    this.dbService = iDB;
    this.storeName = collectionName;
  }

  async initialise() {
    if (this.dbService) {
      await this.dbService.initailise();
      this.store = await this.dbService.getStore(this.storeName);
    } else {
      throw Error("Here");
    }
  }

  async get(): Promise<any[]> {
    if (!this.store) {
      if (this.dbService) {
        await this.initialise();
        return await this.get();
      } else {
        console.error("No DB SERVICE!");
        return [];
      }
    }
    return this.store.getAllDataFromStore();
  }

  async getById(key: string): Promise<any> {
    if (!this.store) {
      if (this.dbService) {
        await this.initialise();
        return await this.getById(key);
      } else {
        console.error("No DB SERVICE!");
        return;
      }
    }
    return this.store.getItemById(key);
  }

  async add(imageKey: string, value: string) {
    if (!this.store) {
      if (this.dbService) {
        await this.dbService.getStore(this.storeName);
        await this.add(imageKey, value);
        return;
      } else {
        console.error("No DB SERVICE!");
        return [];
      }
    }
    await this.store.add(uuidv4(), {
      imageKey,
      value,
    });
  }

  async remove(imageKey: string) {
    if (!this.store) {
      if (this.dbService) {
        await this.initialise();
        await this.remove(imageKey);
        return;
      } else {
        console.error("No DB SERVICE!");
        return [];
      }
    }
    await this.store.removeItemById(imageKey);
  }

  async getByIndex<T, R>(indexName: T, key: string): Promise<R[]> {
    if (!this.store) {
      if (this.dbService) {
        await this.initialise();
        return await this.getByIndex(indexName, key);
      } else {
        console.error("No DB SERVICE!");
        return [];
      }
    }

    return await this.store.getDataUsingIndexByKey<T, R>(indexName, key);
  }
}
