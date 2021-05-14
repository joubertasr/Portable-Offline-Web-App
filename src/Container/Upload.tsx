import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Webcam from "react-webcam";
import { v4 as uuidv4 } from "uuid";
import UploadIcon from "@material-ui/icons/CloudUploadRounded";

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
  upload: {
    display: "none",
  },
  imagePreview: {
    borderStyle: "solid",
    borderWidth: "0.1rem",
    borderColor: theme.palette.primary.light,
    width: "100%",
  },
}));

export const Upload = () => {
  const imageStore = new IndexDBService("POWA", "images");

  const classes = useStyles();
  const [images, setImages] = useState<Array<IImageItem>>([]);

  const uploadRef = React.createRef<HTMLInputElement>();

  const getImages = (cb: (images: Array<IImageItem>) => void) => {
    imageStore
      .getDataAllFromStore()
      .then((images) => {
        cb((images as unknown) as Array<IImageItem>);
      })
      .catch((e) => {
        const t = setTimeout(() => {
          imageStore.getDataAllFromStore().then((images) => {
            cb((images as unknown) as Array<IImageItem>);
          });
        }, 1000);
        console.log("Problem::: ", e);
      });
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    var files = target.files;
    var reader = new FileReader();
    reader.onloadend = async (event: Event) => {
      await imageStore.add(uuidv4(), { src: reader.result });
      getImages((images) => {
        setImages(images);
      });
    };

    files && reader.readAsDataURL(files[0]);
  };

  const upload = () => {
    uploadRef && uploadRef.current && uploadRef.current.click();
  };

  useEffect(() => {
    getImages((images) => {
      setImages(images);
    });
  }, []);

  return (
    <Grid container={true}>
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
export default Upload;
