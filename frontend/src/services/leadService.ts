// Define a shared Lead type, or import from a central types file if it exists
// This should match the structure expected from the backend and used in pages.
interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
  timestamp: string; // Or Date
}

export interface Lead {
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

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';

/**
 * Fetches a paginated and filtered list of leads.
 * @param queryParams - URLSearchParams for page, limit, status, relevanceTag
 */
export const getLeads = async (queryParams: URLSearchParams): Promise<LeadsResponse> => {
  const response = await fetch(`${API_BASE_URL}/conversation/leads?${queryParams.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch leads and parse error' }));
    throw new Error(errorData.message || 'Failed to fetch leads');
  }
  return response.json();
};

/**
 * Fetches a single lead by its ID.
 * @param leadId - The ID of the lead to fetch.
 */
export const getLeadById = async (leadId: string): Promise<Lead> => {
  // Assuming your backend has an endpoint like /conversation/leads/:id
  // If not, this needs to be created in the backend first.
  // For now, let's assume it's /conversation/lead/:id (singular) or adjust as needed.
  // The current backend controller has /conversation/leads for listing,
  // but no specific endpoint for a single lead by ID yet.
  // This will need to be added to the backend ConversationController.
  // For now, this function will likely fail or needs a mock until backend is updated.

  const response = await fetch(`${API_BASE_URL}/conversation/leads/${leadId}`); // Placeholder URL
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch lead details and parse error' }));
    throw new Error(errorData.message || `Failed to fetch lead ${leadId}`);
  }
  return response.json();
};

// Example of how to use it in a component:
/*
useEffect(() => {
  const fetchAllLeads = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '10');
      // params.append('status', 'completed');
      // params.append('relevanceTag', 'Hot lead');
      const data = await getLeads(params);
      console.log(data.leads);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSingleLead = async (id: string) => {
    try {
      const data = await getLeadById(id);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  fetchAllLeads();
  // fetchSingleLead('some-lead-id');
}, []);
*/