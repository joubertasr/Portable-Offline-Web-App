import React, { useState } from "react";
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Box,
  Popover,
  Chip,
} from "@material-ui/core";
import { IImageItem } from "../Types/ImageStore";
import RemoveIcon from "@material-ui/icons/RemoveCircleOutline";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DownloadIcon from "@material-ui/icons/CloudDownloadRounded";
import { red } from "@material-ui/core/colors";
import { ITagItem } from "../Types/TagStore";

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
  imageTitle: {
    cursor: "pointer",
    textAlign: "center",
  },
  editField: {
    flexGrow: 1,
  },
  dangerButton: {
    color: red[200],
  },
  fullHeightCard: {
    height: "100%",
  },
}));

type Props = {
  images: Array<IImageItem>;
  tags: Array<ITagItem>;
  addTag?: (imageKey: string, value: string) => void;
  removeImage: (key: string) => void;
  updateTitle: (key: string, title: string) => void;
};

export function ImageRoll(props: Props) {
  const styles = useStyles();
  return (
    <Grid container={true} spacing={1}>
      {props.images.map((image, i) => (
        <Grid
          key={image.key}
          item={true}
          xs={12}
          sm={6}
          lg={4}
          xl={3}
          className={styles.itemContainer}
        >
          <ImageItem
            details={image}
            removeImage={props.removeImage}
            updateTitle={props.updateTitle}
            addTag={props.addTag}
          />
        </Grid>
      ))}
    </Grid>
  );
}

type ImageProps = {
  details: IImageItem;
  removeImage: (key: string) => void;
  updateTitle: (key: string, title: string) => void;
  addTag?: (imageKey: string, value: string) => void;
};
export function ImageItem(props: ImageProps) {
  const image = props.details;
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(image.data.title);
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<any>();
  const [tagText, setTagText] = useState<string>("");
  const styles = useStyles();

  const [tags, setTags] = useState<string[]>(["Hello", "world"]);
  return (
    <Card className={styles.fullHeightCard}>
      <CardMedia component="img" src={image.data.src} title={title} />
      <CardContent>
        {showEdit ? (
          <Box display="flex">
            <TextField
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              color="primary"
              className={styles.editField}
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
          </Box>
        ) : (
          <Typography gutterBottom component="h3">
            {title}
          </Typography>
        )}
      </CardContent>
      {tags && (
        <CardActions>
          {tags.map((tag) => (
            <Chip
              label={tag}
              onDelete={() => {
                console.log("Remove tag", tag);
                setTags(tags.filter((t) => t !== tag));
              }}
              color="primary"
              size="small"
              key={tag}
            />
          ))}
        </CardActions>
      )}
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => {
            setShowEdit(!showEdit);
          }}
        >
          Rename
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={(e) => {
            e.currentTarget && setAnchorEl(e.currentTarget);
            setOpen(!open);
          }}
        >
          Add Tag
        </Button>
        <Button
          size="small"
          className={styles.dangerButton}
          onClick={async () => {
            await props.removeImage(image.key);
          }}
        >
          <RemoveIcon color="inherit" />
        </Button>
        <a href={`${image.data.src}`} download={`POWA-image-${image.key}.jpg`}>
          <DownloadIcon color="primary" className={styles.icon} />
        </a>
      </CardActions>
      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={() => setOpen(false)}
        disableRestoreFocus
      >
        <Box
          flex={1}
          flexDirection="row"
          display="flex"
          alignItems="center"
          p={1}
        >
          <TextField
            label="Tag"
            variant="outlined"
            value={tagText}
            onChange={(e) => {
              setTagText(e.target.value);
            }}
          />
          <Box px={2}>
            <Button
              onClick={() => {
                setTagText("");
                setTags([...tags, tagText]);
                props.addTag && props.addTag(image.key, tagText);
                console.log("Add tag", tagText, props.addTag);
              }}
            >
              <AddCircleIcon />
            </Button>
          </Box>
        </Box>
      </Popover>
    </Card>
  );
}
