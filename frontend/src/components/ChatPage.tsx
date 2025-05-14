import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress, TextField, Button } from '@mui/material';
import Ably from 'ably';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { ChatMessage } from '../types';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [ablyChannelName] = useState<string>(`chat-${uuidv4()}`);
  const [isSending, setIsSending] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  const ablyClientRef = useRef<Ably.Realtime | null>(null);
  const ablyChannelRef = useRef<Ably.RealtimeChannel | null>(null);
  const currentAiMessageIdRef = useRef<string | null>(null); // To track current AI message for chunking

  useEffect(() => {
    const apiKey = import.meta.env.VITE_ABLY_API_KEY;
    if (!apiKey) {
      console.error("Ably API key is missing. Please set VITE_ABLY_API_KEY in your .env file.");
      // Potentially display an error to the user in the UI
      return;
    }

    const client = new Ably.Realtime({ key: apiKey });
    ablyClientRef.current = client;
    const channel = client.channels.get(ablyChannelName);
    ablyChannelRef.current = channel;

    channel.subscribe('ai_response_chunk', (message) => {
      const { chunk, done, error } = message.data as {
        chunk?: string;
        done: boolean;
        error?: { message: string; [key: string]: unknown };
      };

      if (error) {
        console.error('AI response error from stream:', error);
        setIsAiTyping(false);
        setIsSending(false);
        currentAiMessageIdRef.current = null;
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          sender: 'ai',
          message: `Error: ${error.message || 'An error occurred.'}`,
          timestamp: new Date()
        }]);
        return;
      }

      if (done) {
        setIsAiTyping(false);
        setIsSending(false);
        currentAiMessageIdRef.current = null;
        
        // If the 'done' message also carries a final piece of text (some APIs might do this)
        if (chunk) {
          setMessages(prevMessages => {
            const lastMessage = prevMessages.length > 0 ? prevMessages[prevMessages.length - 1] : null;
            if (lastMessage && lastMessage.sender === 'ai') {
              const updatedMessages = [...prevMessages];
              updatedMessages[prevMessages.length - 1] = {
                ...lastMessage,
                message: lastMessage.message + chunk,
              };
              return updatedMessages;
            }
            // This case (done with chunk, but no prior AI message) is less likely if flow is correct
            return [...prevMessages, {
              id: `ai-done-${Date.now()}`,
              sender: 'ai',
              message: chunk,
              timestamp: new Date()
            }];
          });
        }
        return;
      }

      // If we have a content chunk (and it's not 'done' or 'error')
      if (chunk) {
        console.info(`content-chunk: ${chunk}`); // Keep user's log for now
        
        // Ensure we are in 'typing' state if we receive a content chunk
        // This is a key part of the fix.
        setIsAiTyping(currentIsTyping => {
            if (!currentIsTyping) return true;
            return currentIsTyping;
        });

        setMessages(prevMessages => {
          const lastMessage = prevMessages.length > 0 ? prevMessages[prevMessages.length - 1] : null;

          if (lastMessage && lastMessage.sender === 'ai') {
            // Last message is AI, append to it.
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1] = {
              ...lastMessage,
              message: lastMessage.message + chunk,
            };
            return updatedMessages;
          } else {
            // No last message, or last message was from user. Start a new AI message.
            return [
              ...prevMessages,
              {
                id: `ai-start-${Date.now()}-${Math.random()}`,
                sender: 'ai',
                message: chunk,
                timestamp: new Date(),
              },
            ];
          }
        });
      }
    });

    channel.subscribe('ai_response_error', (message) => {
      const { message: errMsg, detail } = message.data as { message: string; detail: string };
      console.error('AI Response Error Event:', errMsg, detail);
      setMessages(prev => [...prev, { sender: 'ai', message: `Error: ${errMsg} - ${detail}`, timestamp: new Date() }]);
      currentAiMessageIdRef.current = null;
      setIsSending(false);
      setIsAiTyping(false);
    });

    return () => {
      if (ablyChannelRef.current) {
        ablyChannelRef.current.unsubscribe();
      }
      if (ablyClientRef.current) {
        ablyClientRef.current.close();
      }
    };
  }, [ablyChannelName]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    setIsAiTyping(true); // AI will start "typing"
    const userMessage: ChatMessage = {
      sender: 'user',
      message: messageText,
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    currentAiMessageIdRef.current = null; // Reset AI message tracking

    try {
      const requestBody: {
        leadId?: string;
        email?: string;
        message: string;
        ablyChannelName: string;
      } = {
        message: messageText,
        ablyChannelName: ablyChannelName,
      };

      if (leadId) {
        requestBody.leadId = leadId;
        // Optionally, you can still send the email on subsequent requests if your backend handles it
        // requestBody.email = email;
      } else {
        // This is the first message
        requestBody.email = email;
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/conversation`, requestBody);
      const { conversationId } = response.data;

      if (conversationId && !leadId) {
        setLeadId(conversationId);
      }
      // setIsSending(false) will be handled by Ably 'done' or 'error' event
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { sender: 'ai', message: 'Error sending message. Please try again.', timestamp: new Date() }]);
      setIsSending(false); // Allow user to send again if HTTP request fails
      setIsAiTyping(false);
    }
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setEmailError('Email cannot be empty.');
      return;
    }
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setIsEmailSubmitted(true);
  };

  // Main chat layout
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', backgroundColor: 'transparent' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ padding: 2, textAlign: 'center', flexShrink: 0 /* MuiPaper theme override will provide background */ }}>
        <Typography variant="h6">AI Sales Representative</Typography>
      </Paper>

      {/* Message List Area / Content Area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', padding: 2, display: 'flex', flexDirection: 'column' }}>
        {!isEmailSubmitted && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1, // Allow email form to take available space
              padding: 3,
            }}
          >
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, width: '100%', maxWidth: 400 }}>
              <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
                Welcome to AI Sales Chat
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', marginBottom: 3 }}>
                Please enter your email to start chatting.
              </Typography>
              <Box component="form" onSubmit={handleEmailSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Start Chat
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {isEmailSubmitted && (
          <MessageList messages={messages} isAiTyping={isAiTyping} />
        )}
      </Box>

      {/* Loading Indicator - positioned above input, could be refined */}
      {isSending && !currentAiMessageIdRef.current && (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 1, flexShrink: 0 }}>
          <CircularProgress size={24} />
          <Typography sx={{ marginLeft: 1 }}>AI is thinking...</Typography>
        </Box>
      )}

      {/* Message Input Area */}
      <Box sx={{ flexShrink: 0 }}> {/* Prevents input from shrinking */}
        <MessageInput onSendMessage={handleSendMessage} />
      </Box>
    </Box>
  );
};

export default ChatPage;