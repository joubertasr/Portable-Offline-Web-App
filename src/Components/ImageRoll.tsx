import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
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
type Props = {
  images: Array<IImageItem>;
  removeImage: (key: string) => void;
};
export function ImageRoll(props: Props) {
  const styles = useStyles();
  console.log(styles.video);
  return (
    <Grid container={true}>
      {props.images.map((image, i) => (
        <Grid key={image.key} item={true} xs={12} sm={6} lg={4} xl={2}>
          <img
            src={image.src}
            className={styles.imagePreview}
            onClick={() => {
              props.removeImage(image.key);
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
