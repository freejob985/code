// Updated third-party integrations - GitHub Gist only
import { firebaseStorage } from './firebaseStorage';
import { getLanguageExtension } from './codeHighlight';

export interface ExportResult {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// GitHub Gist integration (kept as requested)
export class GitHubGistAPI {
  private token: string;

  constructor(token?: string) {
    this.token = token || '';
  }

  async setToken(token: string) {
    this.token = token;
    await firebaseStorage.saveSetting('github_token', token);
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      const savedToken = await firebaseStorage.getSetting('github_token');
      this.token = typeof savedToken === 'string' ? savedToken : '';
    }
    return this.token;
  }

  async createGist(title: string, code: string, language: string, isPublic: boolean): Promise<ExportResult> {
    console.log('Creating GitHub Gist:', { title, language, isPublic });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const token = await this.getToken();
    if (!token) {
      return { success: false, error: 'GitHub token غير مُكوَّن. يرجى إضافة مفتاح API في الإعدادات.' };
    }

    try {
      // Real API call to GitHub
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: title,
          public: isPublic,
          files: {
            [`${title.replace(/\s+/g, '_')}.${this.getFileExtension(language)}`]: {
              content: code
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          error: `GitHub API Error: ${error.message || 'فشل في إنشاء Gist'}` 
        };
      }

      const gist = await response.json();
      return { 
        success: true, 
        fileId: gist.id,
        url: gist.html_url
      };
    } catch (error) {
      return { 
        success: false, 
        error: `خطأ في الشبكة: ${error instanceof Error ? error.message : 'فشل في الاتصال'}` 
      };
    }
  }

  private getFileExtension(language: string): string {
    return getLanguageExtension(language);
  }

  async updateGist(fileId: string, title: string, code: string): Promise<ExportResult> {
    console.log('Updating GitHub Gist:', { fileId, title });
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const token = await this.getToken();
    if (!token) {
      return { success: false, error: 'GitHub token غير مُكوَّن' };
    }
    
    try {
      const response = await fetch(`https://api.github.com/gists/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: title,
          files: {
            [`${title.replace(/\s+/g, '_')}.txt`]: {
              content: code
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          error: `GitHub API Error: ${error.message || 'فشل في تحديث Gist'}` 
        };
      }

      const gist = await response.json();
      return { 
        success: true, 
        fileId: gist.id,
        url: gist.html_url
      };
    } catch (error) {
      return { 
        success: false, 
        error: `خطأ في الشبكة: ${error instanceof Error ? error.message : 'فشل في الاتصال'}` 
      };
    }
  }

  async listGists(): Promise<ImportResult> {
    console.log('Listing GitHub Gists');
    
    const token = await this.getToken();
    if (!token) {
      return { success: false, error: 'GitHub token غير مُكوَّن' };
    }
    
    try {
      const response = await fetch('https://api.github.com/gists', {
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          error: `GitHub API Error: ${error.message || 'فشل في جلب Gists'}` 
        };
      }

      const gists = await response.json();
      return {
        success: true,
        data: gists.map((gist: { id: string; files: Record<string, unknown>; description: string; html_url: string; created_at: string; updated_at: string }) => ({
          id: gist.id,
          filename: Object.keys(gist.files)[0] || 'untitled',
          description: gist.description || 'No description',
          url: gist.html_url,
          created_at: gist.created_at,
          updated_at: gist.updated_at
        }))
      };
    } catch (error) {
      return { 
        success: false, 
        error: `خطأ في الشبكة: ${error instanceof Error ? error.message : 'فشل في الاتصال'}` 
      };
    }
  }
}

// Remove Google Drive and Dropbox classes as requested
// Only GitHub Gist integration remains