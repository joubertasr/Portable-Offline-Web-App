import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Webcam from "react-webcam";
import { v4 as uuidv4 } from "uuid";
import CameraIcon from "@material-ui/icons/Camera";

import { IndexDBService } from "../Services/IndexedDB.service";
import { ImageRoll } from "../Components/ImageRoll";

import { IImageItem } from "../Types/ImageStore";

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
  const imageStore = new IndexDBService("POWA", "images");
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const classes = useStyles();
  const webcamRef = React.useRef<Webcam>(null);
  const [images, setImages] = useState<Array<IImageItem>>([]);

  const capture = React.useCallback(async () => {
    if (webcamRef && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          await imageStore.add(uuidv4(), { src: imageSrc });
          getImages((images) => {
            setImages(images);
          });
        } catch (e) {
          console.log("----Error: ", e);
        }
      }
    }
  }, [webcamRef]);

  const getImages = (cb: (images: Array<IImageItem>) => void) => {
    imageStore
      .getDataAllFromStore()
      .then((images) => {
        cb((images as unknown) as Array<IImageItem>);
      })
      .catch((e) => {
        console.log("Problem::: ", e);
      });
  };

  useEffect(() => {
    imageStore.initailise().then(() => {
      getImages((images) => {
        setImages(images);
      });
    });
  }, []);

  return (
    <Grid container={true}>
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
        <ImageRoll
          images={images}
          removeImage={(key) => {
            imageStore.removeItemById(key);
            getImages((images) => {
              setImages(images);
            });
          }}
        />
      )}
    </Grid>
  );
};
export default Camera;
