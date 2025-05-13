import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Added Link
import { getLeadById } from '../services/leadService'; // Import the actual service

// Define a type for the Lead object (can be shared or imported from leadService.ts or a central types file)
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
        console.log('Fetching lead details for ID:', leadId);
        const data = await getLeadById(leadId);
        setLead(data);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch lead details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [leadId]);

  if (loading) return <p>Loading lead details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!lead) return <p>Lead not found.</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Link to="/admin/leads" style={{ marginBottom: '20px', display: 'inline-block' }}>&larr; Back to All Leads</Link>
      <h1>Lead Details: {lead.email}</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <p><strong>ID:</strong> {lead._id}</p>
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Company:</strong> {lead.companyName || 'N/A'}</p>
        <p><strong>Status:</strong> <span style={getStatusStyle(lead.status)}>{lead.status}</span></p>
        <p><strong>Qualification:</strong> <span style={getRelevanceStyle(lead.relevanceTag)}>{lead.relevanceTag}</span></p>
        <p><strong>Calendly Link Clicked:</strong> {lead.calendlyLinkClicked ? 'Yes' : 'No'}</p>
        <p><strong>Clarification Attempts:</strong> {lead.clarificationAttempts}</p>
        <p><strong>Created:</strong> {new Date(lead.createdAt).toLocaleString()}</p>
        <p><strong>Last Updated:</strong> {new Date(lead.updatedAt).toLocaleString()}</p>
      </div>

      <h2>Conversation History</h2>
      <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '500px', overflowY: 'auto' }}>
        {lead.chatHistory.length > 0 ? (
          lead.chatHistory.map((msg, index) => (
            <div key={index} style={chatMessageStyle(msg.sender)}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                {msg.sender === 'user' ? 'User' : 'AI Assistant'}
                <span style={{ fontSize: '0.8em', color: '#777', marginLeft: '10px' }}>
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </span>
              </p>
              <p style={{ margin: 0 }}>{msg.message}</p>
            </div>
          ))
        ) : (
          <p style={{ padding: '10px' }}>No conversation history available.</p>
        )}
      </div>
    </div>
  );
};

const chatMessageStyle = (sender: 'user' | 'ai'): React.CSSProperties => ({
  padding: '10px 15px',
  margin: '10px',
  borderRadius: '10px',
  backgroundColor: sender === 'user' ? '#e1f5fe' : '#f1f1f1',
  textAlign: sender === 'user' ? 'right' : 'left',
  alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
  maxWidth: '70%',
  marginLeft: sender === 'user' ? 'auto' : '0',
  marginRight: sender === 'ai' ? 'auto' : '0',
});

const getStatusStyle = (status: string): React.CSSProperties => {
  let backgroundColor = '#eee';
  let color = '#333';
  if (status === 'completed') {
    backgroundColor = '#d4edda'; // green
    color = '#155724';
  } else if (status === 'pending') {
    backgroundColor = '#fff3cd'; // yellow
    color = '#856404';
  }
  return {
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    backgroundColor,
    color,
  };
};

const getRelevanceStyle = (relevance: string): React.CSSProperties => {
  let backgroundColor = '#e9ecef';
  let color = '#495057';
  if (relevance === 'Hot lead' || relevance === 'Very big potential customer') {
    backgroundColor = '#f8d7da'; // red-ish for hot
    color = '#721c24';
  } else if (relevance === 'Weak lead') {
    backgroundColor = '#cce5ff'; // blue-ish for weak
    color = '#004085';
  }
  return {
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    backgroundColor,
    color,
  };
};

export default LeadDetailPage;