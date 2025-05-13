import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      component="form" // Use form for better semantics, helps with Enter key press
      onSubmit={(e) => { e.preventDefault(); handleSend(); }} // Handle form submission
      sx={{
        display: 'flex',
        alignItems: 'center', // Align items vertically
        padding: '16px', // Consistent padding
        borderTop: (theme) => `1px solid ${theme.palette.divider}`, // Use theme for border color
        backgroundColor: 'background.paper', // Match paper background
      }}
    >
      <TextField
        fullWidth
        variant="outlined" // Or "filled" or "standard" depending on desired look
        placeholder="Send a message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress} // Keep for Shift+Enter for new line if desired in future
        multiline // Allow multiline input
        maxRows={5} // Limit the number of rows for multiline
        sx={{
          marginRight: 2, // Increased margin
          '& .MuiOutlinedInput-root': { // Style the input field itself
            borderRadius: '20px', // Rounded corners for the input field
          },
        }}
      />
      <Button
        type="submit" // Make button submit the form
        variant="contained"
        color="primary"
        onClick={handleSend} // Still keep onClick for direct clicks
        disabled={!inputValue.trim()} // Disable button if input is empty
        sx={{
          borderRadius: '20px', // Rounded corners for the button
          paddingX: 3, // Adjust padding for better appearance
        }}
      >
        Send
      </Button>
    </Box>
  );
};

export default MessageInput;