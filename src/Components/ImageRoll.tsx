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
  tagFilter: string;
  addTag: (imageKey: string, value: string) => void;
  removeTag: (key: string) => void;
  removeImage: (key: string) => void;
  updateTitle: (key: string, title: string) => void;
  setTagFilter: (filter: string) => void;
};

export function ImageRoll(props: Props) {
  const styles = useStyles();
  const taggedPhotos = props.tags
    .filter((t) => props.tagFilter === "" || t.data.value === props.tagFilter)
    .map((t) => t.data.imageKey);
  return (
    <>
      {props.tagFilter !== "" && (
        <Button onClick={() => props.setTagFilter("")}>Clear filter</Button>
      )}
      <Grid container={true} spacing={1}>
        {props.images
          .filter(
            (i) => props.tagFilter === "" || taggedPhotos.indexOf(i.key) > -1
          )
          .map((image, i) => (
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
                tagFilter={props.tagFilter}
                addTag={props.addTag}
                tags={props.tags.filter((t) => t.data.imageKey === image.key)}
                removeTag={props.removeTag}
                removeImage={props.removeImage}
                updateTitle={props.updateTitle}
                setTagFilter={props.setTagFilter}
              />
            </Grid>
          ))}
      </Grid>
    </>
  );
}

type ImageProps = Pick<
  Props,
  | "addTag"
  | "removeTag"
  | "removeImage"
  | "updateTitle"
  | "setTagFilter"
  | "tagFilter"
> & {
  details: IImageItem;
  tags: ITagItem[];
};
export function ImageItem(props: ImageProps) {
  const image = props.details;
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(image.data.title);
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<any>();
  const tags = props.tags;
  const [tagText, setTagText] = useState<string>("");
  const styles = useStyles();
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
              label={tag.data.value}
              onDelete={() => {
                props.removeTag(tag.key);
              }}
              onClick={() => {
                props.setTagFilter(
                  props.tagFilter !== "" ? "" : tag.data.value
                );
              }}
              color={props.tagFilter !== tag.data.value ? "default" : "primary"}
              size="small"
              key={tag.key}
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
                props.addTag && props.addTag(image.key, tagText);
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
