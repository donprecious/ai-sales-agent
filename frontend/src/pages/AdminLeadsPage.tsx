import React, { useEffect, useState } from 'react';
import { getLeads } from '../services/leadService';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  Link,
  Grid,
} from '@mui/material';

// Define a type for the Lead object based on backend schema
interface Lead {
  _id: string;
  email: string;
  companyName?: string;
  relevanceTag: string; // e.g., 'Hot lead', 'Weak lead'
  status: string; // e.g., 'pending', 'completed'
  chatHistory: { sender: string; message: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

const AdminLeadsPage: React.FC = () => {
  const [leadsResponse, setLeadsResponse] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('');

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (statusFilter) params.append('status', statusFilter);
        if (relevanceFilter) params.append('relevanceTag', relevanceFilter);
        
        // console.log(`Fetching leads with params: ${params.toString()}`);
        const data = await getLeads(params);
        setLeadsResponse(data);

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch leads.');
        } else {
          setError('An unknown error occurred while fetching leads.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [page, limit, statusFilter, relevanceFilter]);

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    if (leadsResponse && page < Math.ceil(leadsResponse.total / limit)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'text.primary' }}>
      <CircularProgress color="primary" />
      <Typography sx={{ ml: 2 }}>Loading leads...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="error">{error}</Typography>
    </Box>
  );
  
  if (!leadsResponse || leadsResponse.leads.length === 0 && !loading) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="text.secondary">No leads found.</Typography>
       { (statusFilter || relevanceFilter) &&
         <Button variant="outlined" onClick={() => { setStatusFilter(''); setRelevanceFilter(''); setPage(1);}} sx={{mt: 2}}>Clear Filters</Button>
       }
    </Box>
  );


  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, color: 'text.primary', flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
        Admin - All Leads
      </Typography>
      
      <Paper sx={{ mb: 3, p: 2.5 }}>
        <Grid container spacing={2} alignItems="flex-end">
          {/* @ts-expect-error - MUI Grid type issue with 'item' prop in this project setup */}
          <Grid item={true} xs={12} sm={6} md={3}>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
              SelectProps={{
                sx: {
                  '& .MuiSelect-select': {
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    fontSize: '1.05rem',
                  },
                }
              }}
            >
              <MenuItem value=""><em>All Statuses</em></MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="qualified">Qualified</MenuItem>
              <MenuItem value="unqualified">Unqualified</MenuItem>
              <MenuItem value="proposal_sent">Proposal Sent</MenuItem>
              <MenuItem value="negotiation">Negotiation</MenuItem>
              <MenuItem value="closed_won">Closed Won</MenuItem>
              <MenuItem value="closed_lost">Closed Lost</MenuItem>
            </TextField>
          </Grid>
          {/* @ts-expect-error - MUI Grid type issue with 'item' prop in this project setup */}
          <Grid item={true} xs={12} sm={6} md={3}>
            <TextField
              select
              label="Qualification"
              value={relevanceFilter}
              onChange={(e) => { setRelevanceFilter(e.target.value); setPage(1); }}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
              SelectProps={{
                sx: {
                  '& .MuiSelect-select': {
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    fontSize: '1.05rem',
                  },
                }
              }}
            >
              <MenuItem value=""><em>All Qualifications</em></MenuItem>
              <MenuItem value="Not relevant">Not relevant</MenuItem>
              <MenuItem value="Weak lead">Weak lead</MenuItem>
              <MenuItem value="Potential lead">Potential lead</MenuItem>
              <MenuItem value="Good lead">Good lead</MenuItem>
              <MenuItem value="Hot lead">Hot lead</MenuItem>
              <MenuItem value="Very big potential customer">Very big potential</MenuItem>
            </TextField>
          </Grid>
           {/* @ts-expect-error - MUI Grid type issue with 'item' prop in this project setup */}
           <Grid item={true} xs={12} sm={6} md={3}>
             {(statusFilter || relevanceFilter) && (
                <Button
                  variant="outlined"
                  onClick={() => { setStatusFilter(''); setRelevanceFilter(''); setPage(1);}}
                  fullWidth
                  sx={{ height: '56px' }} // Match TextField height
                >
                  Clear Filters
                </Button>
             )}
           </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' /* Ensure Paper styles from theme apply */ }}>
        <Table sx={{ minWidth: 650 }} aria-label="leads table">
          <TableHead sx={{ backgroundColor: 'rgba(48, 25, 52, 0.75)' /* Darker purple for header */ }}>
            <TableRow>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Company</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Qualification</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Last Updated</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leadsResponse?.leads.map((lead) => (
              <TableRow
                key={lead._id}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell component="th" scope="row" sx={{ color: 'text.secondary' }}>
                  {lead.email}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{lead.companyName || 'N/A'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{lead.status}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{lead.relevanceTag}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{new Date(lead.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Link component={RouterLink} to={`/admin/leads/${lead._id}`} sx={{ color: 'primary.main', fontWeight: 'medium', '&:hover': { color: 'primary.light' } }}>
                    View Details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {leadsResponse && leadsResponse.total > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Page {leadsResponse.page} of {Math.ceil(leadsResponse.total / leadsResponse.limit)} (Total: {leadsResponse.total} leads)
          </Typography>
          <Button
            variant="outlined"
            onClick={handleNextPage}
            disabled={!leadsResponse || page >= Math.ceil(leadsResponse.total / leadsResponse.limit)}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AdminLeadsPage;