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
        alignItems: 'center',
        padding: '8px 16px', // Reduced vertical padding, keep horizontal
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        // Apply glassmorphism directly to the Box
        backgroundColor: 'rgba(48, 25, 52, 0.55)', // Same as MuiPaper base for consistency
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        // No border here, as the borderTop is already defined.
        // No boxShadow here, to keep it flatter than elevated Paper components.
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
        maxRows={2} // Reduced maxRows to limit height
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