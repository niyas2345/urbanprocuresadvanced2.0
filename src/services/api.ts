// Urban Procures Advanced
// Real Cloudflare Backend API Client
// Directly connects the locked frontend UI to the persistent D1 & R2 backend

const API_BASE = '/api';

// Browser sessions use server-set HttpOnly cookies; raw session tokens are not persisted.
export function getAuthToken():string|null {return null;}
export function setAuthToken(_token:string|null) {try{localStorage.removeItem('urbanprocures_token');}catch{}}

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

  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid server response');
  }
  const envelope = data as { success?: boolean; error?: string; code?: string };
  if (!response.ok || envelope.success === false) {
    if (envelope.code && ['TERMS_ACCEPTANCE_REQUIRED','REACCEPTANCE_REQUIRED'].includes(envelope.code)) {
      window.dispatchEvent(new CustomEvent('urbanprocures:terms-required'));
    }
    throw new Error(envelope.error || 'Server request failed');
  }

  if(options.method&&options.method!=='GET')window.dispatchEvent(new Event('urbanprocures:updated'));
  return data as T;
}

export const api = {
  terms: {
    get: (role: 'vendor' | 'contractor' | 'get_a_quote', viewed=false) => request(`/terms?role=${role}${viewed?'&viewed=true':''}`),
    status: () => request('/terms/status'),
    accept: (termsVersionId:string) => request('/terms/accept',{method:'POST',body:JSON.stringify({acceptTerms:true,termsVersionId})}),
    adminEvidence: (offset=0,publicConsent=false) => request(`/admin/terms/acceptances?offset=${offset}${publicConsent?'&type=get_a_quote':''}`),
  },
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
    changeStatus:async(id:string,status:string)=>request(`/contractor/rfqs/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}),
    removeRfq:async(id:string)=>request(`/contractor/rfqs/${id}`,{method:'DELETE'}),
    getRfqs: async () => {
      const res = await request('/contractor/rfqs');
      return res.data;
    },
    updateRfq:async(id:string,data:any)=>{const res=await request(`/contractor/rfqs/${id}`,{method:'PUT',body:JSON.stringify(data)});return res.data;},
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
    withdrawQuote:(id:string,action:'recall'|'remove')=>request(`/vendor/quotations/${id}/${action}`,{method:'POST',body:'{}'}),
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
    getRevision:async()=>{const res=await request('/admin/revision');return res.data.revision;},
    getNotifications:async()=>{const res=await request('/admin/notifications');return res.data;},
    getDocumentHistory:async()=>{const res=await request('/admin/documents/history');return res.data;},
    getRfqHistory:async()=>{const res=await request('/admin/rfqs/history');return res.data;},
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
    getAwards:async()=>{const res=await request('/admin/awards');return res.data;},
    getQuotations:async(history=false)=>{const res=await request(history?'/admin/quotations/history':'/admin/quotations');return res.data;},
    verifyContractor:(id:string)=>request(`/admin/contractors/${id}/verification`,{method:'PATCH',body:JSON.stringify({verified:true})}),
    releaseDocument:(id:string)=>request(`/admin/documents/${id}/release`,{method:'POST',body:JSON.stringify({identityReviewConfirmed:true})}),
    verifyVendor: (id:string,status:string) => request(`/admin/vendors/${id}/verification`,{method:'PATCH',body:JSON.stringify({status})}),
    scheduleSiteVisit: (id:string,scheduledDate:string,inspectorName:string) => request(`/admin/public-quotes/${id}`,{method:'PATCH',body:JSON.stringify({status:'site_visit_scheduled',scheduledDate,inspectorName})}),
    publishRfq: async (id: string) => {
      return request(`/admin/rfqs/${id}/publish`, { method: 'POST',body:JSON.stringify({identityReviewConfirmed:true}) });
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
