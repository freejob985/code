// Gemini AI integration for auto-completing snippet fields
export class GeminiAI {
  private apiKeys: string[] = [
    'AIzaSyD7jSzV7S-XwRa8L90KVBxM08g7LSMDeGk',
    'AIzaSyCTYH7rvcxwjemRqYO1_zy6fftpXtJ7x7s',
    'AIzaSyCwYAwZIqKE_727iTqIbYWLBvrt8ebW-0k',
    'AIzaSyC2uWuYocXExJfqQxeBaV90ZIvdx1EibCc',
    'AIzaSyDa-Ad3iE6JwBMy5mg9me2vfXbrdI3bLQo'
  ];
  private currentKeyIndex = 0;

  private getNextApiKey(): string {
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  async generateSnippetDetails(code: string, language: string): Promise<{
    title: string;
    description: string;
    tags: string[];
  } | null> {
    const prompt = `Analyze this ${language} code and provide:
1. A concise, descriptive title (max 60 characters)
2. A clear description explaining what the code does (max 200 characters)
3. 3-5 relevant tags (single words, lowercase, no spaces)

Code:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format:
{
  "title": "Brief descriptive title",
  "description": "Clear explanation of what the code does",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      try {
        const apiKey = this.getNextApiKey();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          })
        });

        if (!response.ok) {
          if (response.status === 429 || response.status === 403) {
            // Rate limit or quota exceeded, try next key
            continue;
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
          throw new Error('No response text received');
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const result = JSON.parse(jsonMatch[0]);
        
        // Validate response structure
        if (!result.title || !result.description || !Array.isArray(result.tags)) {
          throw new Error('Invalid response structure');
        }

        return {
          title: result.title.substring(0, 100),
          description: result.description.substring(0, 1000),
          tags: result.tags.slice(0, 10).map((tag: string) => 
            tag.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
          ).filter((tag: string) => tag.length > 0)
        };

      } catch (error) {
        console.warn(`Gemini API attempt ${attempt + 1} failed:`, error);
        if (attempt === this.apiKeys.length - 1) {
          throw error;
        }
      }
    }

    return null;
  }

  async generateCommandDescription(command: string, category: string): Promise<string | null> {
    const prompt = `Explain this command in Arabic. Be concise and clear (max 100 characters):

Command: ${command}
Category: ${category}

Provide only the Arabic description without any additional text or formatting.`;

    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      try {
        const apiKey = this.getNextApiKey();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200
            }
          })
        });

        if (!response.ok) {
          if (response.status === 429 || response.status === 403) {
            // Rate limit or quota exceeded, try next key
            continue;
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
          throw new Error('No response text received');
        }

        // Clean up the response text
        const cleanText = text.trim().replace(/^["']|["']$/g, '').substring(0, 100);
        return cleanText;

      } catch (error) {
        console.warn(`Gemini API attempt ${attempt + 1} failed:`, error);
        if (attempt === this.apiKeys.length - 1) {
          throw error;
        }
      }
    }

    return null;
  }
}

export const geminiAI = new GeminiAI();