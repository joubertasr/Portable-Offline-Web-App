import React, { useEffect, useState } from "react";
import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
import UploadIcon from "@material-ui/icons/CloudUploadRounded";

import { IndexDBService } from "../Services/IndexedDB.service";
import { ImageRoll } from "../Components/ImageRoll";

import { IImageData, IImageItem } from "../Types/ImageStore";

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
interface Props {
  imageStore: IndexDBService;
}

export const Upload = (props: Props) => {
  const classes = useStyles();
  const [images, setImages] = useState<Array<IImageItem>>([]);

  const uploadRef = React.createRef<HTMLInputElement>();

  const getImages = (cb: (images: Array<IImageItem>) => void) => {
    props.imageStore
      .getAllDataFromStore<IImageData>()
      .then((images: IImageItem[]) => {
        cb(images);
      })
      .catch((e) => {
        console.log("Problem::: ", e);
      });
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    var files = target.files;
    var reader = new FileReader();
    reader.onloadend = async (event: Event) => {
      if (reader.result && typeof reader.result === "string") {
        const today = new Date();
        await props.imageStore.add<IImageData>(uuidv4(), {
          src: reader.result,
          title: `Uploaded on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
        });
        getImages((images) => {
          setImages(images);
        });
      }
    };

    files && reader.readAsDataURL(files[0]);
  };

  const upload = () => {
    uploadRef && uploadRef.current && uploadRef.current.click();
  };

  useEffect(() => {
    async function initialiseStore() {
      await props.imageStore.initailise();
      getImages((images) => {
        setImages(images);
      });
    }
    initialiseStore();
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
          removeImage={async (key) => {
            props.imageStore.removeItemById(key);
            getImages((images) => {
              setImages(images);
            });
          }}
          updateTitle={async (key, title) => {
            const imageDetails = images.filter((i) => i.key === key).pop();
            if (imageDetails) {
              props.imageStore.updateItemById<IImageData>(imageDetails.key, {
                ...imageDetails.data,
                title,
              });

              const updatedImage = await props.imageStore.getItemById<IImageData>(
                key
              );
              setImages(
                images.map((i) => {
                  return i.key === key ? updatedImage : i;
                })
              );
            }
          }}
        />
      )}
    </Grid>
  );
};
export default Upload;
