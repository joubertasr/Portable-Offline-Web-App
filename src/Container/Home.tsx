import React from "react";
import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

function Home() {
  const classes = useStyles();
  return (
    <Grid container={true}>
      <Grid item={true} xs={12}>
        <Paper className={classes.paper}>
          <Typography variant="h1">Purpose</Typography>
          <Typography variant="body1">
            Create an example of a web app that can be wrapped into a single
            file that has all major features of a web app including
            <ul>
              <li>File opening and saving</li>
              <li>Database storage</li>
              <li>Session state</li>
            </ul>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
export default Home;
