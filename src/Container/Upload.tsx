import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import UploadIcon from "@material-ui/icons/CloudUploadRounded";

import { ImageRoll } from "../Components/ImageRoll";

import { IImageItem } from "../Types/ImageStore";
import ImageHelper from "../Utils/ImageHelper";
import TagHelper from "../Utils/TagHelper";
import { ITagItem } from "../Types/TagStore";
import { TagIndexKey } from "../Stores/Database";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    display: "flex",
    flexDirection: "column",
  },
  upload: {
    display: "none",
  },
}));

export const Upload = () => {
  const classes = useStyles();
  const [images, setImages] = useState<Array<IImageItem>>([]);
  const [tags, setTags] = useState<Array<ITagItem>>([]);
  const [tagFilter, setTagFilter] = useState<string>("");

  const uploadRef = React.createRef<HTMLInputElement>();

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    var files = target.files;
    var reader = new FileReader();
    reader.onloadend = async (event: Event) => {
      if (reader.result && typeof reader.result === "string") {
        if (reader.result) {
          ImageHelper.addImage(reader.result.toString());
        }
        setImages(await ImageHelper.get());
      }
    };

    files && reader.readAsDataURL(files[0]);
  };

  const upload = () => {
    uploadRef && uploadRef.current && uploadRef.current.click();
  };

  useEffect(() => {
    async function initialiseStore() {
      setImages(await ImageHelper.get());
      setTags(await TagHelper.get());
    }
    initialiseStore();
  }, []);

  return (
    <Grid container={true} spacing={2}>
      <Grid item={true} xs={12}>
        <Paper className={classes.paper}>
          <Typography variant="h1">Upload</Typography>
          <Typography variant="body1">
            On this page you can upload a picture.
          </Typography>
          <Button onClick={upload}>
            <UploadIcon />
          </Button>
          <input
            className={classes.upload}
            type="file"
            onChange={onChange}
            accept="image/*"
            ref={uploadRef}
          />
        </Paper>
      </Grid>
      {images.length > 0 && (
        <Grid item={true} xs={12}>
          <ImageRoll
            tags={tags}
            images={images}
            tagFilter={tagFilter}
            setTagFilter={(filter: string) => setTagFilter(filter)}
            removeImage={async (key) => {
              ImageHelper.remove(key);
              setImages(await ImageHelper.get());
            }}
            removeTag={async (key) => {
              await TagHelper.remove(key);
              setTags(await TagHelper.get());
            }}
            addTag={async (imageKey, value) => {
              await TagHelper.addTag(imageKey, value);
              const updatedTags = await TagHelper.getByIndex<
                TagIndexKey,
                ITagItem
              >("imageKey", imageKey);
              const otherTags = tags.filter(
                (t) => t.data.imageKey !== imageKey
              );
              setTags([...otherTags, ...updatedTags]);
            }}
            updateTitle={async (key, title) => {
              ImageHelper.updateTitle(key, title);
              setImages(await ImageHelper.get());
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};
export default Upload;
