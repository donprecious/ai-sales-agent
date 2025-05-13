import React, { useEffect, useState } from 'react';
import { getLeads } from '../services/leadService'; // Import the actual service
import { Link } from 'react-router-dom';

// Define a type for the Lead object based on backend schema
// This can be moved to a shared types file if used in multiple places
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
  const [limit] = useState<number>(10); // Or make this configurable
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
        
        console.log(`Fetching leads with params: ${params.toString()}`);
        const data = await getLeads(params);
        setLeadsResponse(data);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch leads.');
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


  if (loading) return <p>Loading leads...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!leadsResponse || leadsResponse.leads.length === 0) return <p>No leads found.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin - All Leads</h1>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <div>
          <label htmlFor="statusFilter">Status: </label>
          <select id="statusFilter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1);}}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            {/* Add other statuses as needed */}
          </select>
        </div>
        <div>
          <label htmlFor="relevanceFilter">Qualification: </label>
          <select id="relevanceFilter" value={relevanceFilter} onChange={(e) => {setRelevanceFilter(e.target.value); setPage(1);}}>
            <option value="">All</option>
            <option value="Not relevant">Not relevant</option>
            <option value="Weak lead">Weak lead</option>
            <option value="Hot lead">Hot lead</option>
            <option value="Very big potential customer">Very big potential</option>
          </select>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Email</th>
            <th style={tableHeaderStyle}>Company</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Qualification</th>
            <th style={tableHeaderStyle}>Last Updated</th>
            <th style={tableHeaderStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leadsResponse.leads.map((lead) => (
            <tr key={lead._id}>
              <td style={tableCellStyle}>{lead.email}</td>
              <td style={tableCellStyle}>{lead.companyName || 'N/A'}</td>
              <td style={tableCellStyle}>{lead.status}</td>
              <td style={tableCellStyle}>{lead.relevanceTag}</td>
              <td style={tableCellStyle}>{new Date(lead.updatedAt).toLocaleString()}</td>
              <td style={tableCellStyle}>
                <Link to={`/admin/leads/${lead._id}`}>View Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {leadsResponse.page} of {Math.ceil(leadsResponse.total / leadsResponse.limit)} (Total: {leadsResponse.total})
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= Math.ceil(leadsResponse.total / leadsResponse.limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  borderBottom: '2px solid #ddd',
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#f9f9f9',
};

const tableCellStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '12px',
};

export default AdminLeadsPage;