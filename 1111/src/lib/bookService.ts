/**
 * Service for loading Harry Potter book content from files
 */

// Cache for book content to avoid repeated file loading
let bookCache: { [key: string]: string } = {};
let combinedBookContext: string | null = null;

/**
 * Load a book file from the public folder
 */
async function loadBookFile(filename: string): Promise<string> {
  try {
    if (bookCache[filename]) {
      return bookCache[filename];
    }
    
    const response = await fetch(`/books/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load book: ${filename}`);
    }
    
    const text = await response.text();
    bookCache[filename] = text;
    return text;
  } catch (error) {
    console.error(`Error loading book file ${filename}:`, error);
    return '';
  }
}

/**
 * Get key information from a book's content by extracting important sections
 */
function extractKeyInformation(bookContent: string, bookNumber: number): string {
  // Get key sections (first few paragraphs, important character intros, etc.)
  const maxChars = 1500; // Limit characters per book since token limits are strict
  
  // Extract important sections based on book number
  let importantContent = '';
  
  // Just take beginnings for now as a simple approach
  // In production, this would be more sophisticated
  importantContent = bookContent.substring(0, maxChars);
  
  return importantContent;
}

/**
 * Get a compact context containing key information from all books
 * This is optimized to fit within token limits
 */
export async function getBookContext(): Promise<string> {
  // Return cached result if available
  if (combinedBookContext) {
    return combinedBookContext;
  }
  
  const bookFiles = [
    'J. K. Rowling - Harry Potter 1 - Sorcerer\'s Stone (1).txt',
    'J. K. Rowling - Harry Potter 2 - The Chamber Of Secrets.txt',
    'J. K. Rowling - Harry Potter 3 - Prisoner of Azkaban.txt',
    'J. K. Rowling - Harry Potter 4 - The Goblet of Fire.txt'
  ];
  
  try {
    // Load books one by one and process them to save memory
    const processedBooks = [];
    
    for (let i = 0; i < bookFiles.length; i++) {
      const bookNumber = i + 1;
      const bookTitle = bookNumber === 1 ? "Philosopher's Stone" : 
                       bookNumber === 2 ? "Chamber of Secrets" : 
                       bookNumber === 3 ? "Prisoner of Azkaban" : 
                       "Goblet of Fire";
                       
      // Load and process each book
      const bookContent = await loadBookFile(bookFiles[i]);
      const keyInfo = extractKeyInformation(bookContent, bookNumber);
      
      processedBooks.push(`BOOK ${bookNumber}: Harry Potter and the ${bookTitle}\n\n${keyInfo}`);
    }
    
    // Combine books
    combinedBookContext = processedBooks.join('\n\n---\n\n');
    return combinedBookContext;
    
  } catch (error) {
    console.error('Error getting book context:', error);
    return 'Error loading books. Please try again later.';
  }
}

/**
 * Get all four Harry Potter books
 */
export async function loadAllBooks(): Promise<string[]> {
  const bookFiles = [
    'J. K. Rowling - Harry Potter 1 - Sorcerer\'s Stone (1).txt',
    'J. K. Rowling - Harry Potter 2 - The Chamber Of Secrets.txt',
    'J. K. Rowling - Harry Potter 3 - Prisoner of Azkaban.txt',
    'J. K. Rowling - Harry Potter 4 - The Goblet of Fire.txt'
  ];
  
  const bookContents = await Promise.all(
    bookFiles.map(filename => loadBookFile(filename))
  );
  
  return bookContents;
}

/**
 * Get a specific book by number (1-4)
 */
export async function loadBook(bookNumber: number): Promise<string> {
  if (bookNumber < 1 || bookNumber > 4) {
    throw new Error('Invalid book number. Must be between 1 and 4.');
  }
  
  const bookFiles = [
    'J. K. Rowling - Harry Potter 1 - Sorcerer\'s Stone (1).txt',
    'J. K. Rowling - Harry Potter 2 - The Chamber Of Secrets.txt',
    'J. K. Rowling - Harry Potter 3 - Prisoner of Azkaban.txt',
    'J. K. Rowling - Harry Potter 4 - The Goblet of Fire.txt'
  ];
  
  return loadBookFile(bookFiles[bookNumber - 1]);
} 