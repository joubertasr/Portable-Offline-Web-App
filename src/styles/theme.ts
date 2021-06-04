import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import lightBlue from "@material-ui/core/colors/lightBlue";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: lightBlue[500],
    },
  },
  overrides: {
    MuiInputBase: {
      input: {
        color: blue[500],
      },
    },
  },
});

export default responsiveFontSizes(theme);
