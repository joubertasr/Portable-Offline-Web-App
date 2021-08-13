import { IndexDBService, ISchema } from "../Services/IndexedDB.service";

const imageSchema: ISchema = {
  version: 1,
  storeName: "images",
  indexes: [],
};
// add the store and its schema to the db

const iDB = IndexDBService.get("POWA");
iDB.addStore(imageSchema);

const ImageStore = async () => {
  await iDB.initailise();
  return iDB.getStore("images");
};

export default ImageStore;
