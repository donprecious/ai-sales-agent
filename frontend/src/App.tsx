import React from 'react';
import ChatPage from './components/ChatPage';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';

// A simple theme for now, can be expanded later
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A standard blue
    },
    secondary: {
      main: '#dc004e', // A standard pink
    },
    background: {
      default: '#f4f6f8', // This will be the main chat area background
      paper: '#ffffff',   // Used for elements like the input bar or message bubbles
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  }
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <ChatPage />
      </Box>
    </ThemeProvider>
  );
};

export default App;
