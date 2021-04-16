import React, { useState } from "react";
import {
  AppBar,
  Container,
  Drawer,
  IconButton,
  ListItem,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@material-ui/core";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import MailIcon from "@material-ui/icons/Mail";

import "./App.scss";
import theme from "./styles/theme";
import Home from "./Container/Home";

type IPage = "Home" | "File";

function App() {
  const [menuOpen, setMenuOpen] = useState<boolean>();
  const [page, setPage] = useState<IPage>("Home");

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => {
                setMenuOpen(true);
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Portal Offline Web App</Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="top"
          open={menuOpen}
          onClose={() => {
            setMenuOpen(false);
          }}
        >
          <ListItem button key={"Test"}>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Test"} />
          </ListItem>
        </Drawer>
        {page === "Home" && <Home />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
