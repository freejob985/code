import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { PasswordProtection } from './components/PasswordProtection';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SnippetList } from './components/SnippetList';
import { SnippetForm } from './components/SnippetForm';
import { FavoritesPage } from './components/FavoritesPage';
import { Settings } from './components/Settings';
import { CodeSnippet, Comment, Review, Tag, Category } from './types';
import { storage } from './utils/storage';
import { GitHubGistAPI } from './utils/thirdParty';
import { LANGUAGE_CATEGORIES } from './utils/codeHighlight';
import toast from 'react-hot-toast';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/atom-one-dark.css';

// Sample data for demo purposes
const generateSampleData = () => {
  const sampleSnippets: CodeSnippet[] = [
    {
      id: 'snippet_' + Date.now() + '_1',
      title: 'React useEffect Hook Example',
      description: 'A comprehensive example of using useEffect hook in React for data fetching and cleanup',
      code: `import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

export default UserProfile;`,
      language: 'javascript',
      tags: ['react', 'hooks', 'useeffect', 'javascript', 'frontend'],
      visibility: 'public',
      isFavorite: true,
      version: 1,
      rating: 4.5,
      reviewCount: 3,
      commentCount: 2,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'snippet_' + Date.now() + '_2',
      title: 'Django REST API View',
      description: 'Django REST framework API view with authentication and pagination',
      code: `from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from .models import Post
from .serializers import PostSerializer

class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostListCreateView(generics.ListCreateAPIView):
    """
    List all posts or create a new post.
    """
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = PostPagination
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def get_queryset(self):
        queryset = Post.objects.all()
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category=category)
        return queryset.order_by('-created_at')

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a post instance.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]`,
      language: 'django',
      tags: ['django', 'rest-framework', 'api', 'python', 'backend'],
      visibility: 'public',
      isFavorite: false,
      version: 1,
      rating: 4.2,
      reviewCount: 5,
      commentCount: 3,
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-14T15:45:00Z'
    },
    {
      id: 'snippet_' + Date.now() + '_3',
      title: 'Laravel API Controller',
      description: 'Laravel controller with resource methods and validation',
      code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Product;
use App\\Http\\Requests\\ProductRequest;
use App\\Http\\Resources\\ProductResource;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::query();
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }
        
        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        // Sort by price or name
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $products = $query->paginate(15);
        
        return ProductResource::collection($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        $product = Product::create($request->validated());
        
        return new ProductResource($product);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return new ProductResource($product->load('category', 'reviews'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        $product->update($request->validated());
        
        return new ProductResource($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}`,
      language: 'php',
      tags: ['laravel', 'php', 'api', 'controller', 'backend'],
      visibility: 'public',
      isFavorite: true,
      version: 1,
      rating: 4.8,
      reviewCount: 7,
      commentCount: 4,
      createdAt: '2024-01-13T09:20:00Z',
      updatedAt: '2024-01-13T09:20:00Z'
    },
    {
      id: 'snippet_' + Date.now() + '_4',
      title: 'CSS Grid Layout Template',
      description: 'Responsive CSS Grid layout with modern design patterns',
      code: `/* Modern CSS Grid Layout */
.container {
  display: grid;
  grid-template-columns: 
    [full-start] minmax(1rem, 1fr)
    [content-start] repeat(12, [col-start] minmax(0, 5rem) [col-end])
    [content-end] minmax(1rem, 1fr) [full-end];
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

/* Header spanning full width */
.header {
  grid-column: full-start / full-end;
  grid-row: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Main content area */
.main {
  grid-column: content-start / content-end;
  grid-row: 2;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  padding: 2rem 0;
}

/* Sidebar */
.sidebar {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

/* Footer */
.footer {
  grid-column: full-start / full-end;
  grid-row: 3;
  background: #343a40;
  color: white;
  padding: 2rem;
  text-align: center;
}

/* Card grid for content */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1rem 1fr 1rem;
  }
  
  .main {
    grid-column: 2;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .sidebar {
    order: -1;
    position: static;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    grid-template-columns: 0.5rem 1fr 0.5rem;
  }
  
  .header, .footer {
    padding: 1rem 0.5rem;
  }
}`,
      language: 'css',
      tags: ['css', 'grid', 'responsive', 'layout', 'frontend', 'design'],
      visibility: 'public',
      isFavorite: true,
      version: 1,
      rating: 4.8,
      reviewCount: 7,
      commentCount: 4,
      createdAt: '2024-01-13T09:20:00Z',
      updatedAt: '2024-01-13T09:20:00Z'
    }
  ];

  const sampleTags: Tag[] = [
    { id: '1', name: 'react', slug: 'react', count: 1 },
    { id: '2', name: 'javascript', slug: 'javascript', count: 1 },
    { id: '3', name: 'django', slug: 'django', count: 1 },
    { id: '4', name: 'laravel', slug: 'laravel', count: 1 },
    { id: '5', name: 'php', slug: 'php', count: 1 },
    { id: '6', name: 'css', slug: 'css', count: 1 },
    { id: '7', name: 'frontend', slug: 'frontend', count: 2 },
    { id: '8', name: 'backend', slug: 'backend', count: 2 },
    { id: '9', name: 'api', slug: 'api', count: 2 },
    { id: '10', name: 'hooks', slug: 'hooks', count: 1 },
    { id: '11', name: 'responsive', slug: 'responsive', count: 1 }
  ];

  const sampleCategories: Category[] = Object.entries(LANGUAGE_CATEGORIES).map(([key, category]) => ({
    id: key,
    name: category.name,
    slug: key,
    color: category.color,
    icon: category.icon,
    description: `${category.name} development snippets`,
    count: key === 'frontend' ? 2 : key === 'backend' ? 2 : 0
  }));

  const sampleComments: Comment[] = [
    {
      id: '1',
      snippetId: '1',
      author: 'John Doe',
      content: 'Great example! This really helped me understand useEffect cleanup.',
      status: 'visible',
      createdAt: '2024-01-15T12:00:00Z'
    },
    {
      id: '2',
      snippetId: '1',
      author: 'Jane Smith',
      content: 'The isMounted pattern is essential for avoiding memory leaks.',
      status: 'visible',
      createdAt: '2024-01-15T14:30:00Z'
    }
  ];

  const sampleReviews: Review[] = [
    {
      id: '1',
      snippetId: '1',
      author: 'Alice Johnson',
      rating: 5,
      pros: 'Clear code structure, excellent cleanup handling',
      cons: 'Could use more error handling examples',
      createdAt: '2024-01-15T13:15:00Z'
    }
  ];

  return { sampleSnippets, sampleTags, sampleCategories, sampleComments, sampleReviews };
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Handle authentication
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  // Remove Bolt badge hook - إزالة شارة Bolt
  useEffect(() => {
    const removeBoltBadge = () => {
      try {
        const selectors = [
          'div[style*="position: fixed"][style*="bottom: 1rem"][style*="right: 1rem"][style*="z-index: 2147483647"]',
          'div[style*="position:fixed"][style*="bottom:1rem"][style*="right:1rem"][style*="z-index:2147483647"]',
          'div[style*="2147483647"]',
          '.bolt-badge',
          '#bolt-badge'
        ];
        
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => element?.remove());
        });
        
        // Remove elements containing "Made in Bolt"
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
          if (div.textContent?.includes('Made in Bolt')) {
            div.remove();
          }
        });
      } catch (error) {
        console.error('Error removing Bolt badge:', error);
      }
    };

    // Run immediately and then every second
    removeBoltBadge();
    const interval = setInterval(removeBoltBadge, 1000);

    // Observer for DOM changes
    const observer = new MutationObserver(removeBoltBadge);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // Load data on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      try {
        let storedSnippets = await storage.getSnippets();
        let storedTags = await storage.getTags();
        let storedCategories = await storage.getCategories();
        let storedComments = await storage.getComments();
        let storedReviews = await storage.getReviews();

        // If no data exists, populate with sample data
        if (storedSnippets.length === 0) {
          const { sampleSnippets, sampleTags, sampleComments, sampleReviews, sampleCategories } = generateSampleData();
          await storage.saveSnippets(sampleSnippets);
          await storage.saveTags(sampleTags);
          await storage.saveCategories(sampleCategories);
          await storage.saveComments(sampleComments);
          await storage.saveReviews(sampleReviews);
          storedSnippets = sampleSnippets;
          storedTags = sampleTags;
          storedCategories = sampleCategories;
          storedComments = sampleComments;
          storedReviews = sampleReviews;
        }

        // Initialize categories if empty
        if (storedCategories.length === 0) {
          const defaultCategories: Category[] = Object.entries(LANGUAGE_CATEGORIES).map(([key, category]) => ({
            id: key,
            name: category.name,
            slug: key,
            color: category.color,
            icon: category.icon,
            description: `${category.name} development snippets`,
            count: 0
          }));
          await storage.saveCategories(defaultCategories);
          storedCategories = defaultCategories;
        }
        
        setSnippets(storedSnippets);
        setTags(storedTags);
        setCategories(storedCategories);
        setComments(storedComments);
        setReviews(storedReviews);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data from Firebase');
      }
    };
    
      loadData();
  }, [isAuthenticated]);

  const handleCreateSnippet = () => {
    setEditingSnippet(null);
    setShowForm(true);
  };

  const handleEditSnippet = (snippet: CodeSnippet) => {
    setEditingSnippet(snippet);
    setShowForm(true);
  };

  const handleSaveSnippet = async (data: Partial<CodeSnippet>) => {
    try {
      // Check for duplicate titles (excluding current snippet if editing)
      const titleExists = snippets.some(existingSnippet => 
        existingSnippet.title.toLowerCase().trim() === (data.title || '').toLowerCase().trim() && 
        (!editingSnippet || existingSnippet.id !== editingSnippet.id)
      );
      
      if (titleExists) {
        toast.error('A snippet with this title already exists. Please choose a different title.');
        return;
      }

      // Update categories count when saving snippet
      if (data.category) {
        const updatedCategories = categories.map(cat => {
          if (cat.id === data.category) {
            return { ...cat, count: cat.count + (editingSnippet ? 0 : 1) };
          }
          return cat;
        });
        setCategories(updatedCategories);
        await storage.saveCategories(updatedCategories);
      }

    if (editingSnippet) {
      // Update existing snippet
      const updatedSnippet: CodeSnippet = {
        ...editingSnippet,
        ...data,
        category: data.category || editingSnippet.category,
        updatedAt: new Date().toISOString(),
        version: editingSnippet.version + 1
      };
      
        const savedId = await storage.saveSnippet(updatedSnippet);
        if (savedId) {
      const updatedSnippets = snippets.map(s => 
        s.id === editingSnippet.id ? updatedSnippet : s
      );
      setSnippets(updatedSnippets);
        toast.success('Snippet updated successfully!');
        }
    } else {
      // Create new snippet
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 9);
      const uniqueId = `snippet_${timestamp}_${randomSuffix}`;
      
      console.log('Creating new snippet with ID:', uniqueId);
      
      const newSnippet: CodeSnippet = {
        id: uniqueId,
        title: data.title || '',
        description: data.description || '',
        code: data.code || '',
        language: data.language || 'javascript',
        category: data.category || '',
        tags: data.tags || [],
        visibility: data.visibility || 'private',
        isFavorite: false,
        version: 1,
        rating: 0,
        reviewCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
        const savedId = await storage.saveSnippet(newSnippet);
        if (savedId) {
          // Use the savedId from Firebase if different from our generated ID
          if (savedId !== uniqueId) {
            newSnippet.id = savedId;
            console.log('Firebase assigned different ID:', savedId);
          }
          console.log('Final snippet ID:', newSnippet.id);
      const updatedSnippets = [...snippets, newSnippet];
      setSnippets(updatedSnippets);
        toast.success('Snippet created successfully!');
        }
    }

    // Update tags
      await updateTags(data.tags || []);
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast.error('Failed to save snippet');
    }
    setShowForm(false);
    setEditingSnippet(null);
  };

  const updateTags = async (newTags: string[]) => {
    try {
    const updatedTags = [...tags];
    
    newTags.forEach(tagName => {
      const existingTag = updatedTags.find(t => t.name === tagName);
      if (existingTag) {
        existingTag.count += 1;
      } else {
        updatedTags.push({
          id: Date.now().toString() + Math.random(),
          name: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, '-'),
          count: 1
        });
      }
    });

    setTags(updatedTags);
      await storage.saveTags(updatedTags);
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    console.log('handleDeleteSnippet called with ID:', id, typeof id);
    
    // Find the snippet first to validate
    const snippet = snippets.find(s => s.id === id);
    if (!snippet) {
      toast.error('Snippet not found');
      console.error('Snippet not found with ID:', id);
      return;
    }
    
    console.log('Found snippet to delete:', snippet.title, 'ID:', snippet.id);
    
    if (!id || id.trim() === '' || id === 'undefined' || id === 'null') {
      toast.error('Cannot delete snippet: Invalid ID');
      console.error('Attempted to delete snippet with invalid ID:', id);
      return;
    }
    
    console.log('Attempting to delete snippet with ID:', id);
    
    try {
      const success = await storage.deleteSnippet(id);
      if (success) {
    const updatedSnippets = snippets.filter(s => s.id !== id);
    setSnippets(updatedSnippets);
        toast.success('Snippet deleted successfully');
        console.log('Snippet deleted successfully:', id);
      } else {
        toast.error('Failed to delete snippet from database');
        console.error('Firebase delete operation failed for ID:', id);
      }
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast.error('Failed to delete snippet');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const snippet = snippets.find(s => s.id === id);
      if (!snippet) return;
      
      const updatedSnippet = { ...snippet, isFavorite: !snippet.isFavorite };
      await storage.saveSnippet(updatedSnippet);
      
    const updatedSnippets = snippets.map(s => 
        s.id === id ? updatedSnippet : s
    );
    setSnippets(updatedSnippets);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleExportSnippet = async (snippet: CodeSnippet, provider: string) => {
    if (provider === 'gist') {
      const api = new GitHubGistAPI();
      return await api.createGist(
        snippet.title,
        snippet.code,
        snippet.language,
        snippet.visibility === 'public'
      );
    }
    return { success: false, error: 'Unsupported provider' };
  };

  const handleExportSnippetData = async (data: Partial<CodeSnippet>, provider: string) => {
    try {
      if (provider === 'gist') {
        const api = new GitHubGistAPI();
        return await api.createGist(
          data.title || 'Untitled',
          data.code || '',
          data.language || 'javascript',
          data.visibility === 'public'
        );
      }
      return { success: false, error: 'Unsupported provider' };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: 'Export failed' };
    }
  };

  const handleExportData = async (): Promise<string> => {
    return await storage.exportData();
  };

  const handleImportData = async (data: string): Promise<boolean> => {
    const success = await storage.importData(data);
    if (success) {
      // Reload data
      const [newSnippets, newTags, newComments, newReviews] = await Promise.all([
        storage.getSnippets(),
        storage.getTags(),
        storage.getComments(),
        storage.getReviews()
      ]);
      setSnippets(newSnippets);
      setTags(newTags);
      setComments(newComments);
      setReviews(newReviews);
    }
    return success;
  };

  // Show password protection if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <PasswordProtection onAuthenticated={handleAuthenticated} />
      </ThemeProvider>
    );
  }

  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
          {currentPage === 'dashboard' && (
            <Dashboard 
              snippets={snippets} 
              comments={comments} 
              reviews={reviews}
              onEditSnippet={handleEditSnippet}
              onDeleteSnippet={handleDeleteSnippet}
              onViewSnippet={(snippet) => {
                setEditingSnippet(snippet);
                setCurrentPage('snippets');
              }}
            />
          )}
          
          {currentPage === 'snippets' && (
            <SnippetList
              snippets={snippets}
              tags={tags}
              categories={categories}
              comments={comments}
              onCreateSnippet={handleCreateSnippet}
              onEditSnippet={handleEditSnippet}
              onDeleteSnippet={handleDeleteSnippet}
              onToggleFavorite={handleToggleFavorite}
              onExportSnippet={handleExportSnippet}
              onCommentsUpdate={setComments}
            />
          )}
          
          {currentPage === 'favorites' && (
            <FavoritesPage
              snippets={snippets}
              tags={tags}
              categories={categories}
              comments={comments}
              onEditSnippet={handleEditSnippet}
              onDeleteSnippet={handleDeleteSnippet}
              onToggleFavorite={handleToggleFavorite}
              onExportSnippet={handleExportSnippet}
              onCommentsUpdate={setComments}
            />
          )}
          
          {currentPage === 'settings' && (
            <Settings
              categories={categories}
              onUpdateCategories={setCategories}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}
        </Layout>

        {showForm && (
          <SnippetForm
            snippet={editingSnippet || undefined}
            tags={tags}
            categories={categories}
            existingSnippets={snippets}
            onSave={handleSaveSnippet}
            onCancel={() => {
              setShowForm(false);
              setEditingSnippet(null);
            }}
            onExport={handleExportSnippetData}
          />
        )}

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            duration: 4000,
          }}
        />
      </div>
    </ThemeProvider>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap App with Error Boundary
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;