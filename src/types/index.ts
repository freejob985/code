export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  category?: string;
  tags: string[];
  visibility: 'private' | 'unlisted' | 'public';
  isFavorite: boolean;
  providerStorage?: 'gist' | 'drive' | 'dropbox';
  providerFileId?: string;
  version: number;
  rating: number;
  reviewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  snippetId: string;
  author: string;
  content: string;
  status: 'visible' | 'hidden';
  createdAt: string;
}

export interface Review {
  id: string;
  snippetId: string;
  author: string;
  rating: number;
  pros: string;
  cons: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
  category?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description?: string;
  count: number;
  languages?: string[];
}

export interface ProviderConfig {
  type: 'gist' | 'drive' | 'dropbox';
  connected: boolean;
  accountEmail?: string;
  tokenExpiry?: string;
}

export interface SearchFilters {
  query: string;
  tags: string[];
  language: string;
  category: string;
  visibility: string;
  sortBy: 'recent' | 'popular' | 'rated' | 'name';
}

export interface Statistics {
  totalSnippets: number;
  publicSnippets: number;
  privateSnippets: number;
  totalTags: number;
  totalCategories: number;
  averageRating: number;
  languageDistribution: { name: string; value: number; color: string }[];
  categoryDistribution: { name: string; value: number; color: string; icon: string }[];
  tagFrequency: { name: string; value: number }[];
  activityData: { date: string; created: number; updated: number; exported: number }[];
}