import { IImageData, IImageItem } from "../Types/ImageStore";
import { v4 as uuidv4 } from "uuid";
import { ImageStore } from "../Stores/Collections";

export const getImages = async (): Promise<IImageItem[]> => {
  return await ImageStore().then((iStore) =>
    iStore.getAllDataFromStore<IImageData>()
  );
};

export const getImage = async (key: string): Promise<IImageItem> => {
  return await ImageStore().then((iStore) => iStore.getItemById(key));
};

export const addImage = async (imageSrc: string): Promise<void> => {
  const today = new Date();
  await ImageStore().then((iStore) =>
    iStore.add<IImageData>(uuidv4(), {
      src: imageSrc,
      title: `Taken on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
    })
  );
};

export const removeImage = async (key: string) => {
  await ImageStore().then((iStore) => iStore.removeItemById(key));
};

export const updateTitle = async (key: string, title: string) => {
  const imageDetails = await getImage(key);
  if (imageDetails) {
    await ImageStore().then((iStore) =>
      iStore.updateItemById<IImageData>(imageDetails.key, {
        ...imageDetails.data,
        title,
      })
    );
  }
};
