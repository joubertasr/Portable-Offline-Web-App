import React, { useState } from "react";
import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Webcam from "react-webcam";
import { IndexDBService } from "../Services/IndexedDB.service";

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

function Camera() {
  const imageStore = new IndexDBService("POWA", "images");
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const classes = useStyles();
  const webcamRef = React.useRef<Webcam>(null);

  const [previewSrc, setPreviewSrc] = useState<string>();
  const capture = React.useCallback(async () => {
    if (webcamRef && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          await imageStore.add("image", { src: imageSrc });
          const data: any = await imageStore.getDataFromStore("image");
          setPreviewSrc(data.src);
        } catch (e) {
          console.log("----Error: ", e);
        }
      }
    }
  }, [webcamRef]);

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
            onClick={capture}
          />
        </Paper>
      </Grid>
      {previewSrc && (
        <Grid item={true} xs={4}>
          <img src={previewSrc} className={classes.imagePreview} />
        </Grid>
      )}
    </Grid>
  );
}
export default Camera;
