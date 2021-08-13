import { IndexDBService, ISchema } from "../Services/IndexedDB.service";

const tagSchema: ISchema = {
  version: 2,
  storeName: "tags",
  indexes: [
    {
      indexName: "imageKey",
      keyPath: "imageKey",
    },
  ],
};
// add the store and its schema to the db

const iDB = IndexDBService.get("POWA");
iDB.addStore(tagSchema);

const TagStore = async () => {
  await iDB.initailise();
  return iDB.getStore("tags");
};

export default TagStore;
