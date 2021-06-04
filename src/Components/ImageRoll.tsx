import React, { useState } from "react";
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { IImageItem } from "../Types/ImageStore";
import RemoveIcon from "@material-ui/icons/RemoveCircleOutline";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
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
    display: "flex",
    alignItems: "center",
  },
  actionContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: `calc(100% - ${theme.spacing(2)}px)`,
    display: "flex",
    flexWrap: "wrap",
    padding: theme.spacing(1),
  },
  imageTitle: {
    cursor: "pointer",
    textAlign: "center",
  },
}));
type Props = {
  images: Array<IImageItem>;
  removeImage: (key: string) => void;
  updateTitle: (key: string, title: string) => void;
};
export function ImageRoll(props: Props) {
  return (
    <Grid container={true}>
      {props.images.map((image, i) => (
        <ImageItem
          details={image}
          removeImage={props.removeImage}
          updateTitle={props.updateTitle}
        />
      ))}
    </Grid>
  );
}

type ImageProps = {
  details: IImageItem;
  removeImage: (key: string) => void;
  updateTitle: (key: string, title: string) => void;
};
export function ImageItem(props: ImageProps) {
  const styles = useStyles();
  const image = props.details;
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  return (
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
        {showEdit ? (
          <div>
            <TextField
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              color="primary"
            />
            <Button
              onClick={() => {
                setShowEdit(false);
                props.updateTitle(image.key, title);
              }}
              color="primary"
              variant="text"
            >
              <CheckCircleIcon />
            </Button>
          </div>
        ) : (
          <Typography
            color="primary"
            onClick={() => {
              setShowEdit(true);
              setTitle(image.title);
            }}
            className={styles.imageTitle}
          >
            {image.title}
          </Typography>
        )}
        <RemoveIcon
          color="primary"
          className={styles.icon}
          onClick={() => {
            props.removeImage(image.key);
          }}
        />
        <a href={`${image.src}`} download={`POWA-image-${image.key}.jpg`}>
          <DownloadIcon color="primary" className={styles.icon} />
        </a>
      </div>
      <img src={image.src} className={styles.imagePreview} />
    </Grid>
  );
}
