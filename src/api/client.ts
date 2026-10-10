import {
  Culture,
  CulturalResource,
  Course,
  Contributor,
  Contribution,
  KnowledgeGap,
  AiAskResponse,
  User,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('cultureverse_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Cultures
  async getCultures(): Promise<Culture[]> {
    const res = await fetch(`${API_BASE}/cultures`);
    if (!res.ok) throw new Error('Failed to fetch cultures');
    return res.json();
  },

  async getCultureBySlug(slug: string): Promise<Culture & { categories: any[] }> {
    const res = await fetch(`${API_BASE}/cultures/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch culture details');
    return res.json();
  },

  // Resources
  async getResources(params?: {
    culture?: string;
    category?: string;
    type?: string;
    search?: string;
    limit?: number;
  }): Promise<{ resources: CulturalResource[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.culture) query.set('culture', params.culture);
    if (params?.category) query.set('category', params.category);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/resources?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch cultural resources');
    return res.json();
  },

  async getResourceById(id: string): Promise<CulturalResource> {
    const res = await fetch(`${API_BASE}/resources/${id}`);
    if (!res.ok) throw new Error('Resource not found');
    return res.json();
  },

  // Courses
  async getCourses(params?: { culture?: string; difficulty?: string }): Promise<Course[]> {
    const query = new URLSearchParams();
    if (params?.culture) query.set('culture', params.culture);
    if (params?.difficulty) query.set('difficulty', params.difficulty);

    const res = await fetch(`${API_BASE}/courses?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async getCourseById(id: string): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch course details');
    return res.json();
  },

  async markLessonComplete(courseId: string, lessonId: string): Promise<{ success: boolean; progress: number }> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to record lesson progress');
    return res.json();
  },

  // AI - Ask Your Roots (Gemma on Gemini API)
  async askYourRoots(question: string, culture?: string): Promise<AiAskResponse> {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question, culture: culture || 'all' }),
    });
    const data = await res.json();
    if (!res.ok && res.status !== 502 && res.status !== 503) {
      throw new Error(data.error || 'Failed to query Ask Your Roots');
    }
    return data;
  },

  // Contributors
  async getContributors(): Promise<Contributor[]> {
    const res = await fetch(`${API_BASE}/contributors`);
    if (!res.ok) throw new Error('Failed to fetch contributors');
    return res.json();
  },

  async getContributorById(id: string): Promise<Contributor & { resources: CulturalResource[]; courses: Course[] }> {
    const res = await fetch(`${API_BASE}/contributors/${id}`);
    if (!res.ok) throw new Error('Contributor not found');
    return res.json();
  },

  // Knowledge Gaps
  async getKnowledgeGaps(culture?: string): Promise<KnowledgeGap[]> {
    const query = culture ? `?culture=${culture}` : '';
    const res = await fetch(`${API_BASE}/knowledge-gaps${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch knowledge gaps');
    return res.json();
  },

  async createKnowledgeGap(data: {
    title: string;
    description: string;
    culture_id: string;
    category_id: string;
    why_it_matters?: string;
  }): Promise<KnowledgeGap> {
    const res = await fetch(`${API_BASE}/knowledge-gaps`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit knowledge gap');
    }
    return res.json();
  },

  async voteKnowledgeGap(gapId: string): Promise<{ votes_count: number }> {
    const res = await fetch(`${API_BASE}/knowledge-gaps/${gapId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to vote');
    return res.json();
  },

  // Contributions
  async submitContribution(data: {
    title: string;
    summary: string;
    content: string;
    culture_id: string;
    category_id: string;
    content_type: string;
    language?: string;
    source_references?: string;
    media_url?: string;
    status?: 'draft' | 'pending';
  }): Promise<Contribution> {
    const res = await fetch(`${API_BASE}/contributions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit cultural contribution');
    }
    return res.json();
  },

  async getMyContributions(): Promise<Contribution[]> {
    const res = await fetch(`${API_BASE}/contributions/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch contributions');
    return res.json();
  },

  // Saved Resources
  async getSavedResources(): Promise<CulturalResource[]> {
    const res = await fetch(`${API_BASE}/saved-resources`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch saved resources');
    return res.json();
  },

  async toggleSaveResource(resourceId: string): Promise<{ saved: boolean }> {
    const res = await fetch(`${API_BASE}/saved-resources/${resourceId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle save');
    return res.json();
  },

  // Payments / ALATPay
  async initiateAlatPay(courseId: string): Promise<{
    orderId: string;
    reference: string;
    amount: number;
    currency: string;
    checkoutUrl?: string;
  }> {
    const res = await fetch(`${API_BASE}/payments/initiate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ courseId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initiate payment');
    }
    return res.json();
  },

  async verifyAlatPay(reference: string): Promise<{ success: boolean; message: string; courseId: string }> {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reference }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Payment verification failed');
    }
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Admin unauthorized');
    return res.json();
  },

  async getPendingContributions(): Promise<Contribution[]> {
    const res = await fetch(`${API_BASE}/admin/contributions/pending`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Admin unauthorized');
    return res.json();
  },

  async reviewContribution(id: string, status: 'approved' | 'rejected' | 'revision_requested', notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/contributions/${id}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, review_notes: notes }),
    });
    if (!res.ok) throw new Error('Failed to review contribution');
    return res.json();
  },
};
