import { ITagData, ITagItem } from "../Types/TagStore";
import { v4 as uuidv4 } from "uuid";
import { TagStore } from "../Stores/Collections";

export const getTags = async (): Promise<ITagItem[]> => {
  return await TagStore().then((tagStore) =>
    tagStore.getAllDataFromStore<ITagData>()
  );
};

export const addTag = async (imageKey: string, value: string) => {
  await TagStore().then((tagStore) =>
    tagStore.add(uuidv4(), {
      imageKey,
      value,
    })
  );
};

export const removeTag = async (imageKey: string) => {
  await TagStore().then((tagStore) => tagStore.removeItemById(imageKey));
};

export async function getTagsByIndex<T, R>(indexName: T, key: string) {
  return await TagStore().then((tagStore) => {
    return tagStore.getDataUsingIndexByKey<T, R>(indexName, key);
  });
}
