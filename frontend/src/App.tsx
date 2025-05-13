import React from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import ChatPage from './components/ChatPage';
import AdminLeadsPage from './pages/AdminLeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import { CssBaseline, ThemeProvider, createTheme, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

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
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Sales Rep AI
              </Typography>
              <Button color="inherit" component={RouterLink} to="/">Chat</Button>
              <Button color="inherit" component={RouterLink} to="/admin/leads">Admin Leads</Button>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, p: 0, overflowY: 'auto' }}> {/* Adjusted padding */}
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/admin/leads" element={<AdminLeadsPage />} />
              <Route path="/admin/leads/:leadId" element={<LeadDetailPage />} />
              {/* You can add a 404 page here if needed */}
              <Route path="*" element={<div><h2>404 Not Found</h2><RouterLink to="/">Go Home</RouterLink></div>} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
