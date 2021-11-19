import {
  IndexDBService,
  ISchema,
  IStoreSchema,
} from "../Services/IndexedDB.service";

export type ImageIndexKey = never;

const imageSchema: IStoreSchema<ImageIndexKey> = {
  storeName: "images",
  indexes: [],
};
export type TagIndexKey = "imageKey" | "valueKey";
const tagSchema: IStoreSchema<TagIndexKey> = {
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

export type IndexKeys = ImageIndexKey | TagIndexKey;

const schema: ISchema<IndexKeys> = {
  version: 1,
  stores: [imageSchema, tagSchema],
};

const iDB = IndexDBService.get<IndexKeys>("POWA");
iDB.addSchema(schema);

iDB.setVersion(schema.version);

export default iDB;
