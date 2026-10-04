// Urban Procures Advanced
// Real Cloudflare Backend API Client
// Directly connects the locked frontend UI to the persistent D1 & R2 backend

const API_BASE = '/api';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('urbanprocures_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('urbanprocures_token', token);
    } else {
      localStorage.removeItem('urbanprocures_token');
    }
  } catch {}
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Server request failed');
  }

  return data;
}

export const api = {
  // Authentication & Session
  auth: {
    login: async (email: string, password?: string) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setAuthToken(res.token);
      return res;
    },
    registerContractor: async (data: any) => {
      const res = await request('/auth/register-contractor', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) setAuthToken(res.token);
      return res;
    },
    registerVendor: async (data: any) => {
      const res = await request('/auth/register-vendor', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) setAuthToken(res.token);
      return res;
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setAuthToken(null);
      }
    },
    me: async () => {
      return request('/auth/me');
    },
  },

  // Public Get a Quote
  quotes: {
    createPublic: async (data: any) => {
      return request('/quotes/public', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Contractor
  contractor: {
    getRfqs: async () => {
      const res = await request('/contractor/rfqs');
      return res.data;
    },
    createRfq: async (data: any) => {
      const res = await request('/contractor/rfqs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    },
    getQuotations: async (rfqId: string) => {
      const res = await request(`/contractor/rfqs/${rfqId}/quotations`);
      return res.data;
    },
    confirmAward: async (rfqId: string, quotationId: string) => {
      return request(`/contractor/rfqs/${rfqId}/award`, {
        method: 'POST',
        body: JSON.stringify({ quotationId }),
      });
    },
  },

  // Vendor
  vendor: {
    getMatchingRfqs: async () => {
      const res = await request('/vendor/rfqs');
      return res.data;
    },
    submitQuote: async (rfqId: string, data: any) => {
      const res = await request(`/vendor/rfqs/${rfqId}/quote`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    },
    getMyQuotes: async () => {
      const res = await request('/vendor/my-quotes');
      return res.data;
    },
    acceptTerms: async () => {
      return request('/vendor/terms/accept', { method: 'POST' });
    },
  },

  // Admin
  admin: {
    getPublicQuotes: async () => {
      const res = await request('/admin/public-quotes');
      return res.data;
    },
    updatePublicQuoteStatus: async (id: string, status: string) => {
      return request(`/admin/public-quotes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    getRfqs: async () => {
      const res = await request('/admin/rfqs');
      return res.data;
    },
    publishRfq: async (id: string) => {
      return request(`/admin/rfqs/${id}/publish`, { method: 'POST' });
    },
    getUsers: async () => {
      const res = await request('/admin/users');
      return res.data;
    },
    updateUserStatus: async (id: string, status: string) => {
      return request(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    getContractors: async () => {
      const res = await request('/admin/contractors');
      return res.data;
    },
    getVendors: async () => {
      const res = await request('/admin/vendors');
      return res.data;
    },
    getDocuments: async () => {
      const res = await request('/admin/documents');
      return res.data;
    },
    getServiceCharges: async () => {
      const res = await request('/admin/service-charges');
      return res.data;
    },
    getAuditLogs: async () => {
      const res = await request('/admin/audit-logs');
      return res.data;
    },
    getInvitations: async () => {
      const res = await request('/admin/invitations');
      return res.data;
    },
    sendInvitation: async (recipientEmail: string, organizationName: string, inviteType: string) => {
      return request('/admin/invitations', {
        method: 'POST',
        body: JSON.stringify({ recipientEmail, organizationName, inviteType }),
      });
    },
  },

  // Real Cloudflare R2 Documents
  documents: {
    upload: async (fileData: { fileName: string; fileType: string; data: string; documentPurpose?: string; rfqId?: string; publicQuoteId?: string }) => {
      const res = await request('/documents/upload', {
        method: 'POST',
        body: JSON.stringify(fileData),
      });
      return res.document;
    },
    getViewUrl: (docId: string) => `${API_BASE}/documents/${docId}/view`,
    getDownloadUrl: (docId: string) => `${API_BASE}/documents/${docId}/download`,
  },
};
