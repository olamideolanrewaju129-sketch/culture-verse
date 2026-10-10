export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  preferred_culture_id?: string;
  preferred_culture_slug?: string;
  profile_image?: string;
  biography?: string;
  created_at?: string;
}

export interface Culture {
  id: string;
  name: string;
  slug: string;
  greeting: string;
  description: string;
  hero_subtitle: string;
  cover_image: string;
  status: string;
}

export interface Category {
  id: string;
  culture_id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface CulturalResource {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  culture_id: string;
  category_id: string;
  contributor_id?: string;
  contributor_name?: string;
  content_type: 'article' | 'oral_history' | 'craft_tutorial' | 'recipe' | 'language' | 'interview';
  language: string;
  read_time_minutes: number;
  media_url?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  visibility: string;
  created_at: string;
  culture_name?: string;
  culture_slug?: string;
  category_name?: string;
  category_slug?: string;
  sources?: ResourceSource[];
}

export interface ResourceSource {
  id: string;
  resource_id: string;
  source_title: string;
  source_url?: string;
  author?: string;
  publication_date?: string;
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  culture_id: string;
  instructor_id?: string;
  instructor_name?: string;
  instructor_bio?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_minutes: number;
  price: number;
  currency: string;
  cover_image: string;
  status: string;
  culture_name?: string;
  culture_slug?: string;
  modules?: CourseModule[];
  is_enrolled?: boolean;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  position: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  media_url?: string;
  duration_minutes: number;
  position: number;
  completed?: boolean;
}

export interface Contribution {
  id: string;
  contributor_id: string;
  contributor_name?: string;
  title: string;
  summary: string;
  content: string;
  culture_id: string;
  culture_name?: string;
  category_id: string;
  category_name?: string;
  content_type: string;
  language: string;
  source_references?: string;
  media_url?: string;
  permission_status: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'revision_requested';
  review_notes?: string;
  created_at: string;
}

export interface KnowledgeGap {
  id: string;
  submitted_by: string;
  submitter_name?: string;
  title: string;
  description: string;
  culture_id: string;
  culture_name?: string;
  category_id: string;
  category_name?: string;
  why_it_matters?: string;
  status: 'open' | 'claimed' | 'resolved';
  votes_count: number;
  has_voted?: boolean;
  created_at: string;
}

export interface Contributor {
  id: string;
  full_name: string;
  email: string;
  biography: string;
  profile_image?: string;
  preferred_culture_name?: string;
  preferred_culture_slug?: string;
  resources_count: number;
  courses_count: number;
}

export interface AiAskResponse {
  status: string;
  model?: string;
  answer: string;
  sources: {
    title: string;
    resourceId: string;
    id?: string;
    slug?: string;
    culture_name?: string;
    category_name?: string;
    summary?: string;
  }[];
  error?: string;
}
