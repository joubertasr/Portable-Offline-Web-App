import iDB, { IndexKeys } from "../Stores/Database";
import { CollectionHelper } from "./CollectionHelper";
import { v4 as uuidv4 } from "uuid";

class ImageHelper extends CollectionHelper<IndexKeys> {
  addTag = async (imageKey: string, value: string) => {
    if (!this.store) {
      if (this.dbService) {
        await this.initialise();
        await this.addTag(imageKey, value);
        return;
      } else {
        console.error("No DB SERVICE!");
        return;
      }
    }

    this.store.add(uuidv4(), {
      imageKey,
      value,
    });
  };
}

export default new ImageHelper(iDB, "tags");
