import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getLeadById } from '../services/leadService';
import { Box, Paper, Typography, CircularProgress, Link, Chip } from '@mui/material';

// Define a type for the Lead object
interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
  timestamp: string; // Or Date
}

interface Lead {
  _id: string;
  email: string;
  companyName?: string;
  relevanceTag: string;
  status: string;
  chatHistory: ChatMessage[];
  calendlyLinkClicked: boolean;
  clarificationAttempts: number;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}

const LeadDetailPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!leadId) {
        setError('No Lead ID provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getLeadById(leadId);
        setLead(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch lead details.');
        } else {
          setError('An unknown error occurred while fetching lead details.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [leadId]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading lead details...</Typography>
    </Box>
  );
  if (error) return <Typography color="error" sx={{ p: 3, textAlign: 'center' }}>{error}</Typography>;
  if (!lead) return <Typography sx={{ p: 3, textAlign: 'center' }}>Lead not found.</Typography>;

  return (
    <Box sx={{ p: 3, color: 'text.primary', flexGrow: 1 /* Allow content to take space */ }}>
      <Link component={RouterLink} to="/admin/leads" sx={{ mb: 2, display: 'inline-block', color: 'primary.main' }}>
        &larr; Back to All Leads
      </Link>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
        Lead Details: {lead.email}
      </Typography>
      
      <Paper elevation={3} sx={{ mb: 3, p: 2.5 /* MuiPaper theme styles will apply */ }}>
        <Typography variant="body1" gutterBottom><strong>ID:</strong> {lead._id}</Typography>
        <Typography variant="body1" gutterBottom><strong>Email:</strong> {lead.email}</Typography>
        <Typography variant="body1" gutterBottom><strong>Company:</strong> {lead.companyName || 'N/A'}</Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Status:</strong> <Chip label={lead.status} sx={getStatusChipStyle(lead.status)} size="small" />
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Qualification:</strong> <Chip label={lead.relevanceTag} sx={getRelevanceChipStyle(lead.relevanceTag)} size="small" />
        </Typography>
        <Typography variant="body1" gutterBottom><strong>Calendly Link Clicked:</strong> {lead.calendlyLinkClicked ? 'Yes' : 'No'}</Typography>
        <Typography variant="body1" gutterBottom><strong>Clarification Attempts:</strong> {lead.clarificationAttempts}</Typography>
        <Typography variant="body1" gutterBottom><strong>Created:</strong> {new Date(lead.createdAt).toLocaleString()}</Typography>
        <Typography variant="body1"><strong>Last Updated:</strong> {new Date(lead.updatedAt).toLocaleString()}</Typography>
      </Paper>

      <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', mt: 4, mb: 2 }}>
        Conversation History
      </Typography>
      <Paper elevation={3} sx={{ maxHeight: '500px', overflowY: 'auto', p: 1 /* MuiPaper theme styles will apply */ }}>
        {lead.chatHistory.length > 0 ? (
          lead.chatHistory.map((msg, index) => (
            <Box key={index} sx={chatMessageStyle(msg.sender)}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: msg.sender === 'user' ? 'primary.light' : 'secondary.light' }}>
                {msg.sender === 'user' ? 'User' : 'AI Assistant'}
                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>{msg.message}</Typography>
            </Box>
          ))
        ) : (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No conversation history available.</Typography>
        )}
      </Paper>
    </Box>
  );
};

const chatMessageStyle = (sender: 'user' | 'ai'): React.CSSProperties => ({
  padding: '8px 12px',
  margin: '8px',
  borderRadius: '12px',
  backgroundColor: sender === 'user' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(80, 80, 80, 0.3)', // User: light purple tint, AI: darker semi-transparent
  color: 'rgba(255, 255, 255, 0.9)', // Ensure text is light
  textAlign: sender === 'user' ? 'right' : 'left',
  alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
  maxWidth: '75%',
  marginLeft: sender === 'user' ? 'auto' : '10px', // Add some margin for AI messages
  marginRight: sender === 'ai' ? 'auto' : '10px', // Add some margin for User messages
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
});

const getStatusChipStyle = (status: string): React.CSSProperties => {
  let backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Default semi-transparent light
  let color = 'rgba(255, 255, 255, 0.8)';
  if (status === 'completed') {
    backgroundColor = 'rgba(76, 175, 80, 0.3)'; // Semi-transparent green
    color = '#d4edda';
  } else if (status === 'pending') {
    backgroundColor = 'rgba(255, 193, 7, 0.3)'; // Semi-transparent yellow
    color = '#fff3cd';
  }
  return {
    backgroundColor,
    color,
    fontWeight: 'bold',
    border: `1px solid ${backgroundColor.replace('0.3', '0.5')}` // Slightly more opaque border
  };
};

const getRelevanceChipStyle = (relevance: string): React.CSSProperties => {
  let backgroundColor = 'rgba(255, 255, 255, 0.1)';
  let color = 'rgba(255, 255, 255, 0.8)';
  if (relevance === 'Hot lead' || relevance === 'Very big potential customer') {
    backgroundColor = 'rgba(244, 67, 54, 0.3)'; // Semi-transparent red
    color = '#f8d7da';
  } else if (relevance === 'Weak lead') {
    backgroundColor = 'rgba(33, 150, 243, 0.3)'; // Semi-transparent blue
    color = '#cce5ff';
  }
  return {
    backgroundColor,
    color,
    fontWeight: 'bold',
    border: `1px solid ${backgroundColor.replace('0.3', '0.5')}`
  };
};

export default LeadDetailPage;