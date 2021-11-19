import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Webcam from "react-webcam";

import CameraIcon from "@material-ui/icons/Camera";

import { ImageRoll } from "../Components/ImageRoll";

import { IImageItem } from "../Types/ImageStore";
import { ITagItem } from "../Types/TagStore";
import TagHelper from "../Utils/TagHelper";
import ImageHelper from "../Utils/ImageHelper";
import { TagIndexKey } from "../Stores/Database";

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
  const [tagFilter, setTagFilter] = useState<string>("");

  const capture = React.useCallback(async () => {
    if (webcamRef && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          await ImageHelper.addImage(imageSrc);
          setImages(await ImageHelper.get());
        } catch (e) {
          console.log("----Error: ", e);
        }
      }
    }
  }, [webcamRef]);

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
            tagFilter={tagFilter}
            setTagFilter={(filter: string) => setTagFilter(filter)}
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
            removeTag={async (imageKey) => {
              await TagHelper.remove(imageKey);
              setTags(await TagHelper.get());
            }}
            images={images}
            removeImage={async (key) => {
              ImageHelper.remove(key);
              setImages(await ImageHelper.get());
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
export default Camera;
