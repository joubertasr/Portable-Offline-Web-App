import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { IImageItem } from "../Types/ImageStore";
import RemoveIcon from "@material-ui/icons/RemoveCircleOutline";
import DownloadIcon from "@material-ui/icons/CloudDownloadRounded";
const useStyles = makeStyles((theme) => ({
  icon: {
    cursor: "pointer",
    paddingLeft: theme.spacing(1),
  },
  imagePreview: {
    borderStyle: "solid",
    borderWidth: "0.1rem",
    borderColor: theme.palette.primary.light,
    width: "100%",
  },
  itemContainer: {
    position: "relative",
  },
  actionContainer: {
    position: "absolute",
    top: "50%",
    justifyContent: "center",
    width: "100%",
    display: "flex",
  },
}));
type Props = {
  images: Array<IImageItem>;
  removeImage: (key: string) => void;
};
export function ImageRoll(props: Props) {
  const styles = useStyles();
  return (
    <Grid container={true}>
      {props.images.map((image, i) => (
        <Grid
          key={image.key}
          item={true}
          xs={12}
          sm={6}
          lg={4}
          xl={2}
          className={styles.itemContainer}
        >
          <div className={styles.actionContainer}>
            <RemoveIcon
              color="primary"
              className={styles.icon}
              onClick={() => {
                props.removeImage(image.key);
              }}
            />
            <a href={`${image.src}`} download={`POWA-image-${image.key}.jpg`}>
              <DownloadIcon
                color="primary"
                className={styles.icon}
                onClick={() => {
                  console.log("Download the image");
                }}
              />
            </a>
          </div>
          <img src={image.src} className={styles.imagePreview} />
        </Grid>
      ))}
    </Grid>
  );
}
