import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Webcam from "react-webcam";
import { v4 as uuidv4 } from "uuid";
import CameraIcon from "@material-ui/icons/Camera";

import { ImageRoll } from "../Components/ImageRoll";

import { IImageItem, IImageData } from "../Types/ImageStore";
import imageStore from "../Stores/ImageStore";
import { ITagItem } from "../Types/TagStore";
import { addTag, getTags, removeTag } from "../Utils/TagHelper";
import {
  getImages,
  addImage,
  removeImage,
  updateTitle,
} from "../Utils/ImageHelper";

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
          await addImage(imageSrc);
          setImages(await getImages());
        } catch (e) {
          console.log("----Error: ", e);
        }
      }
    }
  }, [webcamRef]);

  useEffect(() => {
    async function initialiseStore() {
      setImages(await getImages());
      setTags(await getTags());
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
            addTag={async (imageKey, value) => {
              await addTag(imageKey, value);
              setTags(await getTags());
            }}
            removeTag={async (imageKey) => {
              await removeTag(imageKey);
              setTags(await getTags());
            }}
            images={images}
            removeImage={async (key) => {
              removeImage(key);
              setImages(await getImages());
            }}
            updateTitle={async (key, title) => {
              updateTitle(key, title);
              setImages(await getImages());
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};
export default Camera;
