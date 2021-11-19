import iDB, { IndexKeys } from "../Stores/Database";
import { IImageData } from "../Types/ImageStore";
import { CollectionHelper } from "./CollectionHelper";
import { v4 as uuidv4 } from "uuid";

class ImageHelper extends CollectionHelper<IndexKeys> {
  async addImage(imageSrc: string): Promise<void> {
    if (!this.store) {
      if (this.dbService) {
        await this.initialise();
        await this.addImage(imageSrc);
        return;
      } else {
        console.error("No DB SERVICE!");
        return;
      }
    }
    const today = new Date();
    const imageKey = uuidv4();
    const value = {
      src: imageSrc,
      title: `Taken on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
    };
    this.store.add<IImageData>(imageKey, value);
  }

  async updateTitle(key: string, title: string) {
    const imageDetails = await this.getById(key);
    if (imageDetails) {
      return this.store?.updateItemById<IImageData>(imageDetails.key, {
        ...imageDetails.data,
        title,
      });
    }
  }
}

export default new ImageHelper(iDB, "images");
