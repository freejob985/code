import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { ref, set, get, remove } from 'firebase/database';
import { db, rtdb, COLLECTIONS, PROJECT_SLUG } from '../config/firebase';
import { CodeSnippet, Comment, Review, Tag, Category } from '../types';

class FirebaseStorageManager {
  private isInitialized = false;
  private offlineMode = false;
  private initializing = false;

  // Initialize Firebase with proper error handling
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Prevent multiple simultaneous initializations
    if (this.initializing) return;
    this.initializing = true;
    
    try {
      console.log('🔥 Initializing Firebase Storage Manager...');
      
      // Test basic connectivity
      await this.testBasicConnectivity();
      
      this.isInitialized = true;
      this.offlineMode = false;
      console.log('✅ Firebase Storage Manager initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      this.offlineMode = true;
      this.isInitialized = true;
      console.log('🔄 Falling back to offline mode');
    } finally {
      this.initializing = false;
    }
  }

  // Test basic Firebase connectivity
  private async testBasicConnectivity(): Promise<void> {
    try {
      // Test Firestore connectivity
      const testCollection = collection(db, 'connectivity-test');
      await getDocs(testCollection);
      console.log('✅ Firestore connectivity test passed');
      
      // Test Realtime Database connectivity
      const testRef = ref(rtdb, 'connectivity-test');
      await get(testRef);
      console.log('✅ Realtime Database connectivity test passed');
      
    } catch (error) {
      console.error('❌ Firebase connectivity test failed:', error);
      throw error;
    }
  }

  // Connection test for UI
  async testConnection(): Promise<{ success: boolean; error?: string; details?: Record<string, unknown> }> {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      const details: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        projectId: 'bank-code-eb7d0',
        collections: Object.keys(COLLECTIONS),
        offlineMode: this.offlineMode
      };

      // Test Firestore
      try {
        const testCollection = collection(db, `${PROJECT_SLUG}-connection-test`);
        const testDoc = doc(testCollection, 'test');
        
        // Try to write
        await setDoc(testDoc, { 
          test: true, 
          timestamp: serverTimestamp(),
          projectSlug: PROJECT_SLUG 
        });
        
        // Try to read
        const docSnap = await getDoc(testDoc);
        const readSuccess = docSnap.exists();
        
        // Clean up
        await deleteDoc(testDoc);
        
        details.firestore = { 
          read: readSuccess, 
          write: true, 
          error: undefined 
        };
        console.log('✅ Firestore test completed successfully');
      } catch (error) {
        details.firestore = { 
          read: false, 
          write: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        console.error('❌ Firestore test failed:', error);
      }

      // Test Realtime Database
      try {
        const testRef = ref(rtdb, `${PROJECT_SLUG}-connection-test/test`);
        
        // Try to write
        await set(testRef, { 
          test: true, 
          timestamp: Date.now(),
          projectSlug: PROJECT_SLUG 
        });
        
        // Try to read
        const snapshot = await get(testRef);
        const readSuccess = snapshot.exists();
        
        // Clean up
        await remove(testRef);
        
        details.realtimeDatabase = { 
          read: readSuccess, 
          write: true, 
          error: undefined 
        };
        console.log('✅ Realtime Database test completed successfully');
      } catch (error) {
        details.realtimeDatabase = { 
          read: false, 
          write: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        console.error('❌ Realtime Database test failed:', error);
      }

      const firestoreSuccess = Boolean((details.firestore as { read?: boolean; write?: boolean })?.read && 
                                       (details.firestore as { read?: boolean; write?: boolean })?.write);
      const rtdbSuccess = Boolean((details.realtimeDatabase as { read?: boolean; write?: boolean })?.read && 
                                 (details.realtimeDatabase as { read?: boolean; write?: boolean })?.write);
      const success = firestoreSuccess && rtdbSuccess;
      
      console.log(success ? '✅ Connection test completed successfully' : '❌ Connection test failed');
      return { success, details };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('❌ Connection test failed:', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        details: {
          timestamp: new Date().toISOString(),
          projectId: 'bank-code-eb7d0',
          offlineMode: true
        }
      };
    }
  }

  // Get Firebase configuration info
  getFirebaseInfo() {
    return {
      projectId: 'bank-code-eb7d0',
      databaseURL: 'https://bank-code-eb7d0-default-rtdb.firebaseio.com',
      projectSlug: PROJECT_SLUG,
      collections: Object.keys(COLLECTIONS),
      offlineMode: this.offlineMode,
      features: [
        'Firebase Firestore',
        'Firebase Realtime Database',
        'Cloud Messaging',
        'Offline Persistence',
        'Real-time Sync',
        'Data Export/Import'
      ]
    };
  }

  // Helper method for Firestore operations with error handling
  private async firestoreOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      await this.initialize();
      if (this.offlineMode) return fallback;
      return await operation();
    } catch (error) {
      console.error('Firestore operation failed:', error);
      return fallback;
    }
  }

  // Helper method for Realtime Database operations with error handling
  private async realtimeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      await this.initialize();
      if (this.offlineMode) return fallback;
      return await operation();
    } catch (error) {
      console.error('Realtime Database operation failed:', error);
      return fallback;
    }
  }

  // Snippets operations
  async getSnippets(): Promise<CodeSnippet[]> {
    return await this.firestoreOperation(async () => {
      console.log('📖 Loading snippets from Firestore...');
      
      const snippetsCollection = collection(db, COLLECTIONS.SNIPPETS);
      const q = query(snippetsCollection, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const snippets: CodeSnippet[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        snippets.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        } as CodeSnippet);
      });
      
      console.log(`✅ Loaded ${snippets.length} snippets from Firestore`);
      return snippets;
    }, []);
  }

  async saveSnippet(snippet: Partial<CodeSnippet>): Promise<string | null> {
    return await this.firestoreOperation(async () => {
      console.log('💾 Saving snippet to Firestore...', snippet.title);
      
      const snippetsCollection = collection(db, COLLECTIONS.SNIPPETS);
      
      if (snippet.id) {
        // Update existing snippet using setDoc with the existing ID
        const docRef = doc(snippetsCollection, snippet.id);
        await setDoc(docRef, {
          ...snippet,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`✅ Updated existing snippet: ${snippet.id}`);
        return snippet.id;
      } else {
        // Create new snippet with custom ID
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        const customId = `snippet_${timestamp}_${randomSuffix}`;
        
        console.log('Creating new snippet with custom ID:', customId);
        
        const docRef = doc(snippetsCollection, customId);
        await setDoc(docRef, {
          ...snippet,
          id: customId, // Ensure the ID is stored in the document
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Created new snippet: ${customId}`);
        return customId;
      }
    }, null);
  }

  async deleteSnippet(id: string): Promise<boolean> {
    return await this.firestoreOperation(async () => {
      console.log('🗑️ Deleting snippet from Firestore:', id);
      
      const snippetsCollection = collection(db, COLLECTIONS.SNIPPETS);
      const docRef = doc(snippetsCollection, id);
      await deleteDoc(docRef);
      
      console.log(`✅ Deleted snippet: ${id}`);
      return true;
    }, false);
  }

  // Tags operations
  async getTags(): Promise<Tag[]> {
    return await this.firestoreOperation(async () => {
      console.log('🏷️ Loading tags from Firestore...');
      
      const tagsCollection = collection(db, COLLECTIONS.TAGS);
      const querySnapshot = await getDocs(tagsCollection);
      
      const tags: Tag[] = [];
      querySnapshot.forEach((doc) => {
        tags.push({ id: doc.id, ...doc.data() } as Tag);
      });
      
      console.log(`✅ Loaded ${tags.length} tags from Firestore`);
      return tags;
    }, []);
  }

  async saveTags(tags: Tag[]): Promise<boolean> {
    return await this.firestoreOperation(async () => {
      console.log('💾 Saving tags to Firestore...');
      
      const tagsCollection = collection(db, COLLECTIONS.TAGS);
      
      // Save each tag with error handling
      const results = await Promise.allSettled(
        tags.map(async (tag) => {
          const docRef = doc(tagsCollection, tag.id);
          return await setDoc(docRef, tag);
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed > 0) {
        console.warn(`⚠️ ${failed} tags failed to save, ${successful} succeeded`);
      }
      
      console.log(`✅ Saved ${successful}/${tags.length} tags to Firestore`);
      return successful > 0; // Return true if at least some tags were saved
    }, false);
  }

  // Categories operations
  async getCategories(): Promise<Category[]> {
    return await this.firestoreOperation(async () => {
      console.log('📂 Loading categories from Firestore...');
      
      const categoriesCollection = collection(db, COLLECTIONS.CATEGORIES);
      const querySnapshot = await getDocs(categoriesCollection);
      
      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });
      
      console.log(`✅ Loaded ${categories.length} categories from Firestore`);
      return categories;
    }, []);
  }

  async saveCategories(categories: Category[]): Promise<boolean> {
    return await this.firestoreOperation(async () => {
      console.log('💾 Saving categories to Firestore...');
      
      const categoriesCollection = collection(db, COLLECTIONS.CATEGORIES);
      
      // Save each category with error handling
      const results = await Promise.allSettled(
        categories.map(async (category) => {
          const docRef = doc(categoriesCollection, category.id);
          return await setDoc(docRef, category);
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed > 0) {
        console.warn(`⚠️ ${failed} categories failed to save, ${successful} succeeded`);
      }
      
      console.log(`✅ Saved ${successful}/${categories.length} categories to Firestore`);
      return successful > 0; // Return true if at least some categories were saved
    }, false);
  }

  // Comments operations
  async getComments(): Promise<Comment[]> {
    return await this.firestoreOperation(async () => {
      console.log('💬 Loading comments from Firestore...');
      
      const commentsCollection = collection(db, COLLECTIONS.COMMENTS);
      const querySnapshot = await getDocs(commentsCollection);
      
      const comments: Comment[] = [];
      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      
      console.log(`✅ Loaded ${comments.length} comments from Firestore`);
      return comments;
    }, []);
  }

  async saveComments(comments: Comment[]): Promise<boolean> {
    return await this.firestoreOperation(async () => {
      console.log('💾 Saving comments to Firestore...');
      
      const commentsCollection = collection(db, COLLECTIONS.COMMENTS);
      
      // Save each comment with error handling
      const results = await Promise.allSettled(
        comments.map(async (comment) => {
          const docRef = doc(commentsCollection, comment.id);
          return await setDoc(docRef, comment);
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed > 0) {
        console.warn(`⚠️ ${failed} comments failed to save, ${successful} succeeded`);
      }
      
      console.log(`✅ Saved ${successful}/${comments.length} comments to Firestore`);
      return successful > 0; // Return true if at least some comments were saved
    }, false);
  }

  // Reviews operations
  async getReviews(): Promise<Review[]> {
    return await this.firestoreOperation(async () => {
      console.log('⭐ Loading reviews from Firestore...');
      
      const reviewsCollection = collection(db, COLLECTIONS.REVIEWS);
      const querySnapshot = await getDocs(reviewsCollection);
      
      const reviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      
      console.log(`✅ Loaded ${reviews.length} reviews from Firestore`);
      return reviews;
    }, []).catch((error) => {
      console.warn('⚠️ Failed to load reviews from Firestore, using empty array:', error.message);
      return [];
    });
  }

  async saveReviews(reviews: Review[]): Promise<boolean> {
    return await this.firestoreOperation(async () => {
      console.log('💾 Saving reviews to Firestore...');
      
      const reviewsCollection = collection(db, COLLECTIONS.REVIEWS);
      
      // Save each review
      for (const review of reviews) {
        const docRef = doc(reviewsCollection, review.id);
        try {
          await setDoc(docRef, review);
        } catch (error) {
          console.warn(`Failed to save review ${review.id}:`, error);
          // Continue with other reviews even if one fails
        }
      }
      
      console.log(`✅ Saved ${reviews.length} reviews to Firestore`);
      return true;
    }, false);
  }

  // Settings operations using Realtime Database
  async getSetting(key: string): Promise<unknown> {
    return await this.realtimeDbOperation(async () => {
      console.log('⚙️ Getting setting from Realtime Database:', key);
      
      const settingRef = ref(rtdb, `${PROJECT_SLUG}/settings/${key}`);
      const snapshot = await get(settingRef);
      
      if (snapshot.exists()) {
        console.log(`✅ Retrieved setting: ${key}`);
        return snapshot.val();
      }
      
      console.log(`ℹ️ Setting not found: ${key}`);
      return null;
    }, null);
  }

  async saveSetting(key: string, value: unknown): Promise<boolean> {
    return await this.realtimeDbOperation(async () => {
      console.log('💾 Saving setting to Realtime Database:', key);
      
      const settingRef = ref(rtdb, `${PROJECT_SLUG}/settings/${key}`);
      await set(settingRef, value);
      
      console.log(`✅ Saved setting: ${key}`);
      return true;
    }, false);
  }

  // Theme operations
  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    const theme = await this.getSetting('theme');
    return (theme as 'light' | 'dark' | 'system') || 'system';
  }

  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<boolean> {
    return await this.saveSetting('theme', theme);
  }

  // Export all data
  async exportData(): Promise<string> {
    try {
      await this.initialize();
      console.log('📤 Exporting all data from Firebase...');
      
      const [snippets, comments, reviews, tags, categories] = await Promise.all([
        this.getSnippets(),
        this.getComments(),
        this.getReviews(),
        this.getTags(),
        this.getCategories()
      ]);

      const exportData = {
        snippets,
        comments,
        reviews,
        tags,
        categories,
        exportedAt: new Date().toISOString(),
        source: 'firebase',
        projectSlug: PROJECT_SLUG
      };

      console.log('✅ Data export completed successfully');
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return JSON.stringify({
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error',
        exportedAt: new Date().toISOString()
      });
    }
  }

  // Import data
  async importData(jsonData: string): Promise<boolean> {
    try {
      await this.initialize();
      console.log('📥 Importing data to Firebase...');
      
      const data = JSON.parse(jsonData);
      
      const promises = [];
      
      if (data.snippets) {
        // Import snippets one by one to maintain IDs
        for (const snippet of data.snippets) {
          promises.push(this.saveSnippet(snippet));
        }
      }
      
      if (data.comments) promises.push(this.saveComments(data.comments));
      if (data.reviews) promises.push(this.saveReviews(data.reviews));
      if (data.tags) promises.push(this.saveTags(data.tags));
      if (data.categories) promises.push(this.saveCategories(data.categories));
      
      await Promise.all(promises);
      console.log('✅ Data import completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error importing data:', error);
      return false;
    }
  }

  // Batch operations for better performance
  async saveSnippets(snippets: CodeSnippet[]): Promise<boolean> {
    return await this.firestoreOperation(async () => {
      console.log('💾 Batch saving snippets to Firestore...');
      
      const promises = snippets.map(snippet => this.saveSnippet(snippet));
      await Promise.all(promises);
      
      console.log(`✅ Batch saved ${snippets.length} snippets`);
      return true;
    }, false);
  }

  // Clear all data from Firebase
  async clearAllData(): Promise<boolean> {
    try {
      await this.initialize();
      console.log('🗑️ Clearing all data from Firebase...');
      
      // Clear Firestore collections
      const firestorePromises = [
        this.clearFirestoreCollection(COLLECTIONS.SNIPPETS),
        this.clearFirestoreCollection(COLLECTIONS.COMMENTS),
        this.clearFirestoreCollection(COLLECTIONS.REVIEWS),
        this.clearFirestoreCollection(COLLECTIONS.TAGS),
        this.clearFirestoreCollection(COLLECTIONS.CATEGORIES)
      ];
      
      // Clear Realtime Database settings
      const rtdbPromise = this.clearRealtimeDatabaseSettings();
      
      // Execute all clear operations
      await Promise.all([...firestorePromises, rtdbPromise]);
      
      console.log('✅ All data cleared successfully from Firebase');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data from Firebase:', error);
      return false;
    }
  }

  // Helper method to clear a Firestore collection
  private async clearFirestoreCollection(collectionName: string): Promise<void> {
    try {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`✅ Cleared collection: ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error clearing collection ${collectionName}:`, error);
      throw error;
    }
  }

  // Helper method to clear Realtime Database settings
  private async clearRealtimeDatabaseSettings(): Promise<void> {
    try {
      const settingsRef = ref(rtdb, `${PROJECT_SLUG}/settings`);
      await remove(settingsRef);
      console.log('✅ Cleared Realtime Database settings');
    } catch (error) {
      console.error('❌ Error clearing Realtime Database settings:', error);
      throw error;
    }
  }
}

export const firebaseStorage = new FirebaseStorageManager();