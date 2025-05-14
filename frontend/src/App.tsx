import React from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import ChatPage from './components/ChatPage';
import AdminLeadsPage from './pages/AdminLeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import { CssBaseline, ThemeProvider, createTheme, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

// Theme that attempts to blend with Tailwind and apply desired aesthetics
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a78bfa', // Light purple for primary actions/highlights
    },
    secondary: {
      main: '#f48fb1', // A contrasting pink/light purple
    },
    background: {
      // MUI default background will be largely overridden by Tailwind on the body/root div.
      // Paper elements will get specific styling for glassmorphism.
      default: 'transparent', // Make default MUI background transparent
      paper: 'rgba(48, 25, 52, 0.3)', // Base for paper elements, will be enhanced with blur
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)', // Subtle divider for dark theme
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif', // Match Tailwind's default
    h6: {
      color: 'rgba(255, 255, 255, 0.95)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background: linear-gradient(to bottom, #301934, #000000);
          min-height: 100vh; /* Ensure gradient covers full viewport height */
          margin: 0; /* Remove default body margin */
          padding: 0; /* Remove default body padding */
          color: rgba(255, 255, 255, 0.9); /* Default text color for the body */
        }
        #root { /* Ensure the root div also takes full height */
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `,
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to bottom, rgba(48, 25, 52, 0.75), rgba(20, 20, 20, 0.75))', // More direct background gradient
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.95)', // Ensure text color is light
        },
      },
    },
    MuiPaper: { // For Cards, Dialogs, etc.
      styleOverrides: {
        root: {
          // Test with a very distinct color to see if override applies
          // backgroundColor: 'rgba(0, 255, 0, 0.3)', // Semi-transparent green for testing
          backgroundColor: 'rgba(48, 25, 52, 0.55)', // Dark purple, slightly more opaque for better text contrast but still allowing blur
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)', // Slightly more visible border
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)', // Softer, more spread shadow
          borderRadius: '12px', // Consistent rounded corners
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { // Default styles for all buttons
          borderRadius: '8px',
          textTransform: 'none',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)', // Very subtle background for non-contained
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
        containedPrimary: { // Styles for Start Chat button
          backgroundColor: 'rgba(167, 139, 250, 0.6)', // Semi-transparent primary purple
          color: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)', // Apply blur here too
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(167, 139, 250, 0.4)', // Border matching the primary color
          '&:hover': {
            backgroundColor: 'rgba(167, 139, 250, 0.75)', // Darker/more opaque on hover
            borderColor: 'rgba(167, 139, 250, 0.6)',
          },
        },
        textInherit: { // For AppBar buttons
           color: 'rgba(255, 255, 255, 0.85)',
           '&:hover': {
             backgroundColor: 'rgba(255, 255, 255, 0.1)',
             color: 'rgba(255, 255, 255, 1)',
           }
        }
      },
    },
    MuiInputBase: { // For TextField's input area
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker, more transparent for input background
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.15)', // Initial border
          transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&.Mui-focused': {
            borderColor: '#a78bfa', // Primary purple border on focus
            boxShadow: `0 0 0 3px rgba(167, 139, 250, 0.25)`, // Focus ring
          },
        },
      },
    },
    MuiOutlinedInput: { // Specifically for the border of Outlined TextField
        styleOverrides: {
            notchedOutline: {
                borderColor: 'rgba(255, 255, 255, 0.15) !important', // Ensure this applies
            },
            root: {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3) !important',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#a78bfa !important',
                },
            },
        },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: '#a78bfa',
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline /> {/* Applies baseline MUI styles and dark mode if specified in theme */}
        <BrowserRouter>
          {/* MUI AppBar, styled via the theme's components section. Removed color="transparent" */}
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Sales Rep AI
              </Typography>
              <Button color="inherit" component={RouterLink} to="/">Chat</Button>
              <Button color="inherit" component={RouterLink} to="/admin/leads">Admin Leads</Button>
            </Toolbar>
          </AppBar>

          {/* Main content area, MUI Box for structure, pages will be rendered here */}
          <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', p: 0, display: 'flex', flexDirection: 'column' /* Ensure this Box is a flex container */ }}>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/admin/leads" element={<AdminLeadsPage />} />
              <Route path="/admin/leads/:leadId" element={<LeadDetailPage />} />
              {/* Using Tailwind for the 404 page text for simplicity here */}
              <Route path="*" element={<div className="p-8 text-center text-gray-300"><h2 className="text-2xl font-semibold mb-4 text-gray-100">404 Not Found</h2><RouterLink to="/" className="text-purple-400 hover:text-purple-300 transition-colors">Go Home</RouterLink></div>} />
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </Box>
  );
};

export default App;
