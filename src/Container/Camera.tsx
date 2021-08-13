import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Webcam from "react-webcam";
import { v4 as uuidv4 } from "uuid";
import CameraIcon from "@material-ui/icons/Camera";

import { ImageRoll } from "../Components/ImageRoll";

import { IImageItem, IImageData } from "../Types/ImageStore";
import imageStore from "../Stores/ImageStore";
import { ITagData, ITagItem } from "../Types/TagStore";
import { IndexDBStore } from "../Services/IndexedDB.service";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    display: "flex",
    flexDirection: "column",
  },
  video: {
    flex: 1,
    borderStyle: "solid",
    borderWidth: "0.5rem",
    borderColor: theme.palette.primary.main,
  },
  imagePreview: {
    borderStyle: "solid",
    borderWidth: "0.1rem",
    borderColor: theme.palette.primary.light,
    width: "100%",
  },
}));

export const Camera = () => {
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const classes = useStyles();
  const webcamRef = React.useRef<Webcam>(null);
  const [images, setImages] = useState<Array<IImageItem>>([]);
  const [tags, setTags] = useState<Array<ITagItem>>([]);

  const capture = React.useCallback(async () => {
    if (webcamRef && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const today = new Date();
          await imageStore().then((iStore) =>
            iStore.add<IImageData>(uuidv4(), {
              src: imageSrc,
              title: `Taken on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
            })
          );
          setImages(await getImages());
        } catch (e) {
          console.log("----Error: ", e);
        }
      }
    }
  }, [webcamRef]);

  const getImages = async (): Promise<IImageItem[]> => {
    return await imageStore().then((iStore) =>
      iStore.getAllDataFromStore<IImageData>()
    );
  };

  const getTags = (cb: (images: Array<ITagItem>) => void) => {
    // tagStore
    //   .getAllDataFromStore<ITagData>()
    //   .then((tags: ITagItem[]) => {
    //     cb(tags);
    //   })
    //   .catch((e) => {
    //     console.log("Problem::: ", e);
    //   });
  };

  const addTag = (imageKey: string, value: string) => {
    console.log("Save TAG:", imageKey, value);
    // tagStore.add(uuidv4(), {
    //   imageKey,
    //   value,
    // });
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
          <Typography variant="h1">Camera</Typography>
          <Typography variant="body1">
            On this page you can take a picture using the HTML5 camera.
          </Typography>
          <Webcam
            audio={false}
            ref={webcamRef}
            videoConstraints={videoConstraints}
            className={classes.video}
          />
          <Button onClick={capture}>
            <CameraIcon />
          </Button>
        </Paper>
      </Grid>
      {images.length > 0 && (
        <Grid item={true} xs={12}>
          <ImageRoll
            tags={tags}
            addTag={addTag}
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
export default Camera;
