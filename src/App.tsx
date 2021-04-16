import React from "react";
import {
  AppBar,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";

import "./App.scss";

function App() {
  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
          ></IconButton>
          <Typography variant="h6">Portal Offline Web App</Typography>
        </Toolbar>
      </AppBar>
    </Container>
  );
}

export default App;
