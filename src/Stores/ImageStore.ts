import { IndexDBService, ISchema } from "../Services/IndexedDB.service";

export type IndexKey = never;
const imageSchema: ISchema<IndexKey> = {
  version: 1,
  storeName: "images",
  indexes: [],
};
// add the store and its schema to the db

const iDB = IndexDBService.get<IndexKey>("POWA");
iDB.addStore(imageSchema);
iDB.setVersion(imageSchema.version);

const ImageStore = async () => {
  await iDB.initailise();
  return iDB.getStore("images");
};

export default ImageStore;
