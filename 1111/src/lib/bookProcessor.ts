/**
 * Book processor for Harry Potter books
 * Loads and processes books once at application startup
 */

import { nlpProcessor } from './nlp';

interface BookChapter {
  title: string;
  content: string;
  summary: string;
  keyEvents: string[];
  characters: Set<string>;
}

interface Book {
  title: string;
  chapters: BookChapter[];
  mainCharacters: Set<string>;
  locations: Set<string>;
  spells: Set<string>;
}

// Singleton to ensure books are loaded only once
class BookContentProcessor {
  private books: Map<string, Book> = new Map();
  private booksPath: string;
  private isLoading: boolean = false;
  private loadingPromise: Promise<boolean> | null = null;
  
  // Cache for full context to use with language model
  private fullBookContext: string | null = null;

  constructor(booksPath: string) {
    this.booksPath = booksPath;
    // Auto-load books when the module is imported
    this.initializeBooks();
  }
  
  // Initialize books automatically on startup
  private initializeBooks() {
    // Log initialization start
    console.log('Initializing Harry Potter books...');
    
    // Start loading in the background
    this.loadingPromise = this.loadBooks();
    
    // Return initialization status
    return this.loadingPromise.then(() => {
      console.log('✓ Harry Potter books initialized successfully!');
      return true;
    }).catch(error => {
      console.error('× Harry Potter books initialization failed:', error);
      return false;
    });
  }

  /**
   * Load books from the filesystem
   * This is called only once during application startup
   */
  async loadBooks(): Promise<boolean> {
    // Return existing promise if already loading
    if (this.loadingPromise && this.isLoading) {
      return this.loadingPromise;
    }
    
    // Return true if already loaded
    if (this.books.size > 0 && this.fullBookContext) {
      return true;
    }
    
    this.isLoading = true;
    
    const bookFiles = [
      'J. K. Rowling - Harry Potter 1 - Sorcerer\'s Stone (1).txt',
      'J. K. Rowling - Harry Potter 2 - The Chamber Of Secrets.txt',
      'J. K. Rowling - Harry Potter 3 - Prisoner of Azkaban.txt',
      'J. K. Rowling - Harry Potter 4 - The Goblet of Fire.txt'
    ];

    try {
      console.log(`Attempting to load books from: ${this.booksPath}`);
      
      for (const file of bookFiles) {
        const url = `${this.booksPath}/${file}`;
        console.log(`Fetching book: ${url}`);
        
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error(`Failed to load book: ${file}, Status: ${response.status}`);
            throw new Error(`Failed to load book: ${file}, Status: ${response.status}`);
          }
          
          const content = await response.text();
          console.log(`Successfully loaded book: ${file}, Size: ${content.length} characters`);
          
          await this.processBook(file, content);
        } catch (fetchError) {
          console.error(`Error fetching book ${file}:`, fetchError);
          throw fetchError;
        }
      }
      
      // Build the full context for language model
      await this.buildFullContext();
      
      console.log(`Books loaded successfully: ${this.books.size} books in memory`);
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error('Error loading books:', error);
      this.isLoading = false;
      throw error;
    }
  }

  /**
   * Build the full context once for the language model
   * This extracts key information from all books
   */
  private async buildFullContext(): Promise<void> {
    if (this.fullBookContext) return;
    
    const bookContexts: string[] = [];
    
    for (const [title, book] of this.books) {
      // Extract key information
      const keyCharacters = Array.from(book.mainCharacters).slice(0, 10).join(', ');
      
      // Get important passages
      const importantPassages = book.chapters
        .map(chapter => this.getImportantPassage(chapter))
        .filter(passage => passage.length > 0)
        .slice(0, 3);
      
      // Build book summary
      const bookSummary = `BOOK: ${title}\n\n`;
      const charactersInfo = `KEY CHARACTERS: ${keyCharacters}\n\n`;
      const passagesText = importantPassages.join('\n\n---\n\n');
      
      bookContexts.push(bookSummary + charactersInfo + passagesText);
    }
    
    this.fullBookContext = bookContexts.join('\n\n==========\n\n');
  }
  
  /**
   * Get important passage from a chapter
   */
  private getImportantPassage(chapter: BookChapter): string {
    // If there are key events, concatenate the first few
    if (chapter.keyEvents.length > 0) {
      return chapter.keyEvents.slice(0, 3).join(' ');
    }
    
    // Otherwise return the chapter summary
    return chapter.summary;
  }

  private async processBook(filename: string, content: string) {
    const chapters = this.splitIntoChapters(content);
    const book: Book = {
      title: this.extractTitle(filename),
      chapters: [],
      mainCharacters: new Set(),
      locations: new Set(),
      spells: new Set()
    };

    for (const chapter of chapters) {
      const processedChapter = await this.processChapter(chapter);
      book.chapters.push(processedChapter);
      
      // Update book-level information
      processedChapter.characters.forEach(char => book.mainCharacters.add(char));
    }

    this.books.set(book.title, book);
  }

  private splitIntoChapters(content: string): string[] {
    return content.split(/CHAPTER [\w\s]+/)
      .filter(chapter => chapter.trim().length > 0);
  }

  private extractTitle(filename: string): string {
    return filename.replace('.txt', '')
      .split('-')
      .slice(1, -1)
      .join('-')
      .trim();
  }

  private async processChapter(content: string): Promise<BookChapter> {
    const title = this.extractChapterTitle(content);
    const characters = this.extractCharacters(content);
    const keyEvents = this.extractKeyEvents(content);

    return {
      title,
      content,
      summary: this.generateChapterSummary(content),
      keyEvents,
      characters: new Set(characters)
    };
  }

  private extractChapterTitle(content: string): string {
    const titleMatch = content.match(/CHAPTER [\w\s]+/);
    return titleMatch ? titleMatch[0].trim() : 'Untitled Chapter';
  }

  private extractCharacters(content: string): string[] {
    const commonCharacters = [
      'Harry', 'Ron', 'Hermione', 'Dumbledore', 'Snape',
      'Voldemort', 'McGonagall', 'Hagrid', 'Malfoy'
    ];

    return commonCharacters.filter(char =>
      new RegExp(`\\b${char}\\b`, 'i').test(content)
    );
  }

  private extractKeyEvents(content: string): string[] {
    const events: string[] = [];
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (this.isSignificantEvent(sentence)) {
        events.push(sentence.trim());
      }
    }

    return events;
  }

  private isSignificantEvent(sentence: string): boolean {
    const eventIndicators = [
      'suddenly', 'finally', 'discovered', 'revealed',
      'happened', 'occurred', 'appeared', 'disappeared',
      'fought', 'battle', 'duel', 'spell', 'magic'
    ];

    return eventIndicators.some(indicator =>
      sentence.toLowerCase().includes(indicator)
    );
  }

  private generateChapterSummary(content: string): string {
    // For now, return first paragraph as summary
    const firstParagraph = content.split('\n\n')[0];
    return firstParagraph.trim();
  }

  /**
   * Get the full context for the language model
   * This is used to provide context to the Groq API
   */
  async getFullContext(): Promise<string> {
    // Ensure books are loaded
    if (!this.fullBookContext) {
      await this.loadBooks();
    }
    
    return this.fullBookContext || "Error: Could not load book context";
  }

  // Search functionality
  searchBooks(query: string): { book: string; context: string; relevance: number }[] {
    const results: { book: string; context: string; relevance: number }[] = [];

    for (const [title, book] of this.books) {
      for (const chapter of book.chapters) {
        const relevance = nlpProcessor.calculateRelevance(query, chapter.content);
        if (relevance > 0.3) { // Threshold for relevance
          results.push({
            book: title,
            context: this.extractRelevantContext(query, chapter.content),
            relevance
          });
        }
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  private extractRelevantContext(query: string, content: string): string {
    const sentences = content.split(/[.!?]+/);
    const queryTokens = nlpProcessor.processText(query);
    
    // Find sentences with query tokens
    const relevantSentences = sentences.filter(sentence => {
      const sentenceTokens = nlpProcessor.processText(sentence);
      return queryTokens.some(qt => sentenceTokens.includes(qt));
    }).filter(sentence => sentence.trim().length > 0);
    
    // Return a context window of sentences
    if (relevantSentences.length > 0) {
      const mainSentence = relevantSentences[0];
      const mainIndex = sentences.findIndex(s => s === mainSentence);
      
      // Get surrounding context - 2 sentences before and 3 after if available
      const startIndex = Math.max(0, mainIndex - 2);
      const endIndex = Math.min(sentences.length - 1, mainIndex + 3);
      
      return sentences.slice(startIndex, endIndex + 1)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .join('. ');
    }
    
    // If no direct matches, return a portion of the content
    if (content.length > 500) {
      return content.substring(0, 500) + '...';
    }
    
    return content;
  }
}

// Export singleton instance - using absolute path now
export const bookProcessor = new BookContentProcessor(window.location.origin + '/books');