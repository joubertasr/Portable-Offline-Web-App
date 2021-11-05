import { IndexDBService, ISchema } from "../Services/IndexedDB.service";

export type IndexKey = "imageKey" | "valueKey";
const tagSchema: ISchema<IndexKey> = {
  version: 2,
  storeName: "tags",
  indexes: [
    {
      indexName: "imageKey",
      keyPath: "imageKey",
    },
    {
      indexName: "valueKey",
      keyPath: "value",
    },
  ],
};
// add the store and its schema to the db

const iDB = IndexDBService.get<IndexKey>("POWA");
iDB.addStore(tagSchema);
iDB.setVersion(tagSchema.version);

const TagStore = async () => {
  await iDB.initailise();
  return iDB.getStore("tags");
};

export default TagStore;
