import { CodeSnippet, Comment, Review, Tag, Category } from '../types';
import { firebaseStorage } from './firebaseStorage';

// Legacy localStorage keys for migration
const LEGACY_STORAGE_KEYS = {
  SNIPPETS: 'code-vault-snippets',
  COMMENTS: 'code-vault-comments',
  REVIEWS: 'code-vault-reviews',
  TAGS: 'code-vault-tags',
  CATEGORIES: 'code-vault-categories',
  SETTINGS: 'code-vault-settings',
  THEME: 'code-vault-theme'
};

class StorageManager {
  private async migrateFromLocalStorage(): Promise<boolean> {
    try {
      // Check if migration is needed
      let migrated;
      try {
        migrated = await firebaseStorage.getSetting('migrated_from_localstorage');
      } catch (error) {
        console.warn('Could not check migration status, assuming not migrated:', error);
        migrated = false;
      }
      
      if (migrated) return false;

      console.log('Migrating data from localStorage to Firebase...');
      
      // Get data from localStorage
      const localSnippets = this.getFromLocalStorage<CodeSnippet>(LEGACY_STORAGE_KEYS.SNIPPETS);
      const localComments = this.getFromLocalStorage<Comment>(LEGACY_STORAGE_KEYS.COMMENTS);
      const localReviews = this.getFromLocalStorage<Review>(LEGACY_STORAGE_KEYS.REVIEWS);
      const localTags = this.getFromLocalStorage<Tag>(LEGACY_STORAGE_KEYS.TAGS);
      const localCategories = this.getFromLocalStorage<Category>(LEGACY_STORAGE_KEYS.CATEGORIES);
      
      // Migrate to Firebase if data exists
      if (localSnippets.length > 0 || localComments.length > 0 || localReviews.length > 0 || localTags.length > 0 || localCategories.length > 0) {
        try {
          await Promise.all([
            localSnippets.length > 0 ? this.saveSnippetsToFirebase(localSnippets) : Promise.resolve(),
            localComments.length > 0 ? firebaseStorage.saveComments(localComments) : Promise.resolve(),
            localReviews.length > 0 ? firebaseStorage.saveReviews(localReviews) : Promise.resolve(),
            localTags.length > 0 ? firebaseStorage.saveTags(localTags) : Promise.resolve(),
            localCategories.length > 0 ? firebaseStorage.saveCategories(localCategories) : Promise.resolve()
          ]);
        } catch (error) {
          console.warn('Migration partially failed, but continuing:', error);
          // Don't throw error, allow app to continue working
        }
        
        console.log('Migration completed successfully');
      }
      
      // Mark as migrated
      try {
        await firebaseStorage.saveSetting('migrated_from_localstorage', true);
      } catch (error) {
        console.warn('Could not mark migration as complete:', error);
      }
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      // Don't fail completely, allow app to work without migration
      return true;
    }
  }

  private getFromLocalStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveSnippetsToFirebase(snippets: CodeSnippet[]): Promise<void> {
    for (const snippet of snippets) {
      await firebaseStorage.saveSnippet(snippet);
    }
  }

  // Snippets
  async getSnippets(): Promise<CodeSnippet[]> {
    await this.migrateFromLocalStorage();
    return await firebaseStorage.getSnippets();
  }

  async saveSnippets(snippets: CodeSnippet[]): Promise<void> {
    await firebaseStorage.saveSnippets(snippets);
  }

  async saveSnippet(snippet: CodeSnippet): Promise<string | null> {
    return await firebaseStorage.saveSnippet(snippet);
  }

  async deleteSnippet(id: string): Promise<boolean> {
    return await firebaseStorage.deleteSnippet(id);
  }

  // Comments
  async getComments(): Promise<Comment[]> {
    await this.migrateFromLocalStorage();
    return await firebaseStorage.getComments();
  }

  async saveComments(comments: Comment[]): Promise<void> {
    await firebaseStorage.saveComments(comments);
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    await this.migrateFromLocalStorage();
    return await firebaseStorage.getReviews();
  }

  async saveReviews(reviews: Review[]): Promise<void> {
    await firebaseStorage.saveReviews(reviews);
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    await this.migrateFromLocalStorage();
    return await firebaseStorage.getTags();
  }

  async saveTags(tags: Tag[]): Promise<void> {
    await firebaseStorage.saveTags(tags);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    await this.migrateFromLocalStorage();
    return await firebaseStorage.getCategories();
  }

  async saveCategories(categories: Category[]): Promise<void> {
    await firebaseStorage.saveCategories(categories);
  }

  // Settings
  async getSetting(key: string): Promise<any> {
    return await firebaseStorage.getSetting(key);
  }

  async saveSetting(key: string, value: any): Promise<void> {
    await firebaseStorage.saveSetting(key, value);
  }

  // Theme
  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    return await firebaseStorage.getTheme();
  }

  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await firebaseStorage.setTheme(theme);
  }

  // Export all data
  async exportData(): Promise<string> {
    return await firebaseStorage.exportData();
  }

  // Import data
  async importData(jsonData: string): Promise<boolean> {
    return await firebaseStorage.importData(jsonData);
  }

  // Clear all data
  async clearAllData(): Promise<boolean> {
    return await firebaseStorage.clearAllData();
  }
}

export const storage = new StorageManager();