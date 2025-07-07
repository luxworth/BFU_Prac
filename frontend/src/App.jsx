import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NewsList from './components/NewsList';
import Deals from './components/Deals';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function App() {
  const [tab, setTab] = React.useState(0);
  const [mode, setMode] = React.useState('light');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#6750A4',
          },
          secondary: {
            main: '#625B71',
          },
        },
      }),
    [mode],
  );

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              GameGraf
            </Typography>
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{ mr: 2 }}
            >
              <Tab label="Новости" />
              <Tab label="Скидки" />
            </Tabs>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 6, px: { xs: 2, sm: 4 } }}>
          {tab === 0 && <NewsList />}
          {tab === 1 && <Deals />}
        </Container>
      </Box>
    </ThemeProvider>
  );
} 