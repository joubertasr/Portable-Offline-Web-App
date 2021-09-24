import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
import UploadIcon from "@material-ui/icons/CloudUploadRounded";

import { ImageRoll } from "../Components/ImageRoll";

import { IImageData, IImageItem } from "../Types/ImageStore";
import imageStore from "../Stores/ImageStore";

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

  const uploadRef = React.createRef<HTMLInputElement>();

  const getImages = async (): Promise<IImageItem[]> => {
    return await imageStore().then((iStore) =>
      iStore.getAllDataFromStore<IImageData>()
    );
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    var files = target.files;
    var reader = new FileReader();
    reader.onloadend = async (event: Event) => {
      if (reader.result && typeof reader.result === "string") {
        const today = new Date();
        if (reader.result) {
          await imageStore().then((iStore) =>
            iStore.add<IImageData>(uuidv4(), {
              src: reader.result ? reader.result.toString() : "",
              title: `Uploaded on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
            })
          );
        }
        const images = await getImages();
        setImages(images);
      }
    };

    files && reader.readAsDataURL(files[0]);
  };

  const upload = () => {
    uploadRef && uploadRef.current && uploadRef.current.click();
  };

  useEffect(() => {
    async function initialiseStore() {
      setImages(await getImages());
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
            tags={[]}
            images={images}
            removeImage={async (key) => {
              await imageStore().then((iStore) => iStore.removeItemById(key));
              setImages(await getImages());
            }}
            updateTitle={async (key, title) => {
              const imageDetails = images.filter((i) => i.key === key).pop();
              if (imageDetails) {
                await imageStore().then((iStore) =>
                  iStore.updateItemById<IImageData>(imageDetails.key, {
                    ...imageDetails.data,
                    title,
                  })
                );
                setImages(await getImages());
              }
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};
export default Upload;
