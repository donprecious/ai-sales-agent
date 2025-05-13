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
                  backgroundColor: msg.sender === 'user' ? 'primary.light' : 'background.paper', // Adjusted colors
                  color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: msg.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  maxWidth: '70%',
                  wordBreak: 'break-word', // Ensure long messages wrap
                }}
              >
                <Typography variant="body1" component="span">{msg.message}</Typography>
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