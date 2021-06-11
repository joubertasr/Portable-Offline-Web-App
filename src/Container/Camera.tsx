import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Webcam from "react-webcam";
import { v4 as uuidv4 } from "uuid";
import CameraIcon from "@material-ui/icons/Camera";

import { IndexDBService } from "../Services/IndexedDB.service";
import { ImageRoll } from "../Components/ImageRoll";

import { IImageItem, IImageData } from "../Types/ImageStore";

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

interface Props {
  imageStore: IndexDBService;
}

export const Camera = (props: Props) => {
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
          const today = new Date();
          await props.imageStore.add<IImageData>(uuidv4(), {
            src: imageSrc,
            title: `Taken on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
          });
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
    props.imageStore
      .getDataAllFromStore<IImageItem>()
      .then((images) => {
        cb(images);
      })
      .catch((e) => {
        console.log("Problem::: ", e);
      });
  };

  useEffect(() => {
    props.imageStore.initailise().then(() => {
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
            props.imageStore.removeItemById(key);
            getImages((images) => {
              setImages(images);
            });
          }}
          updateTitle={(key, title) => {
            const imageDetails = images.filter((i) => i.key === key).pop();
            if (imageDetails) {
              const imageData = { src: imageDetails.src, title } as IImageData;
              props.imageStore.updateItemById(key, imageData);
              getImages((images) => {
                setImages(images);
              });
            }
          }}
        />
      )}
    </Grid>
  );
};
export default Camera;
