import React, { useEffect, useRef } from 'react';
import { List, ListItem, Paper, Typography, Box } from '@mui/material';
import type { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  isAiTyping?: boolean; // Optional for now, but will be used
}

const MessageList: React.FC<MessageListProps> = ({ messages, isAiTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flexGrow: 1 }}>
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
            <ListItem key={index} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 1, paddingX: 0 /* Adjust padding if needed */ }}>
              <Paper
                elevation={1} // Reduced elevation for a flatter look, can be adjusted
                sx={{
                  padding: '10px 15px',
                  // Use semi-transparent colors to allow backdropFilter from MuiPaper theme to work
                  backgroundColor: msg.sender === 'user'
                    ? 'rgba(167, 139, 250, 0.35)' // Semi-transparent light purple for user
                    : 'rgba(70, 50, 80, 0.45)',   // Slightly different semi-transparent dark purple for AI
                  color: 'text.primary', // Ensure text is readable on these backgrounds
                  borderRadius: msg.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  maxWidth: '70%',
                  wordBreak: 'break-word',
                  // The MuiPaper theme override in App.tsx should provide:
                  // backdropFilter, WebkitBackdropFilter, border, boxShadow, and base borderRadius (if not overridden here)
                }}
              >
                <Typography variant="body1" component="span" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>{msg.message}</Typography>
                {msg.sender === 'ai' && isLastMessage && isAiTyping && (
                  <span className="typing-cursor"></span>
                )}
                <Typography variant="caption" sx={{ display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left', marginTop: '5px', fontSize: '0.7rem', opacity: 0.7 }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </ListItem>
          );
        })}
        <div ref={messagesEndRef} />
      </List>
    </Box>
  );
};

export default MessageList;