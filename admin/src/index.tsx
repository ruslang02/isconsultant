import '@fontsource/roboto';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import indigo from '@material-ui/core/colors/indigo';
import red from '@material-ui/core/colors/red';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.scss';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: indigo[400],
    },
    secondary: {
      main: red[400],
    },
  }
});

const app = document.createElement('div');
app.id = 'app';

document.body.appendChild(app);

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.querySelector('#app'),
);

if (module.hot) {
  module.hot.accept();
}