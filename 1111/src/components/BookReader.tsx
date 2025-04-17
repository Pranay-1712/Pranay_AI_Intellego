import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookAIAssistant } from './BookAIAssistant';

interface BookReaderProps {
  bookFiles?: string[];
}

export function BookReader({ bookFiles }: BookReaderProps) {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [bookContent, setBookContent] = useState<string>('');
  const [bookTitle, setBookTitle] = useState<string>('');
  const [chapter, setChapter] = useState<number>(1);
  const [chapters, setChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookAnimation, setBookAnimation] = useState<boolean>(false);
  const [allContent, setAllContent] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const defaultBookFiles = [
    'J. K. Rowling - Harry Potter 1 - Sorcerer\'s Stone (1).txt',
    'J. K. Rowling - Harry Potter 2 - The Chamber Of Secrets.txt',
    'J. K. Rowling - Harry Potter 3 - Prisoner of Azkaban.txt',
    'J. K. Rowling - Harry Potter 4 - The Goblet of Fire.txt'
  ];
  
  const books = bookFiles || defaultBookFiles;
  
  const extractTitle = (filename: string): string => {
    return filename
      .replace('.txt', '')
      .split('-')
      .slice(1, -1)
      .join('-')
      .trim();
  };
  
  const loadBook = async (index: number) => {
    setIsLoading(true);
    setLoadError(null);
    setBookAnimation(true);
    
    try {
      const bookFile = books[index];
      console.log(`Attempting to load book: ${bookFile}`);
      
      // Try the direct path first with origin
      const bookUrl = `${window.location.origin}/books/${bookFile}`;
      console.log(`Trying book URL: ${bookUrl}`);
      
      let content = '';
      let fetchSuccess = false;
      
      try {
        const response = await fetch(bookUrl);
        
        if (response.ok) {
          content = await response.text();
          console.log(`Book loaded successfully from ${bookUrl}, content length: ${content.length}`);
          fetchSuccess = true;
        } else {
          console.warn(`Failed to fetch from ${bookUrl}, status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching from ${bookUrl}:`, error);
      }
      
      // If the first attempt failed, try alternative paths
      if (!fetchSuccess) {
        const altPaths = [
          `/books/${bookFile}`,
          `/public/books/${bookFile}`,
          `${window.location.origin}/public/books/${bookFile}`
        ];
        
        for (const path of altPaths) {
          if (fetchSuccess) break;
          
          try {
            console.log(`Trying alternative path: ${path}`);
            const response = await fetch(path);
            
            if (response.ok) {
              content = await response.text();
              console.log(`Book loaded successfully from ${path}, content length: ${content.length}`);
              fetchSuccess = true;
              break;
            } else {
              console.warn(`Failed to fetch from ${path}, status: ${response.status}`);
            }
          } catch (error) {
            console.error(`Error fetching from ${path}:`, error);
          }
        }
      }
      
      if (!fetchSuccess) {
        throw new Error(`Failed to load book: ${bookFile}. The book file could not be accessed.`);
      }
      
      if (content.length === 0) {
        throw new Error(`Book file is empty: ${bookFile}`);
      }
      
      processBookContent(content, bookFile);
      
    } catch (error) {
      console.error('Error loading book:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error loading book');
      setIsLoading(false);
      setBookAnimation(false);
    }
  };
  
  const processBookContent = (content: string, bookFile: string) => {
    try {
      console.log(`Processing book content, length: ${content.length}`);
      // Split content into chapters
      const chapterRegex = /CHAPTER [\w\s]+/g;
      const chapterTitles = content.match(chapterRegex) || [];
      
      console.log(`Found ${chapterTitles.length} chapters`);
      
      if (chapterTitles.length === 0) {
        // If no chapters found, treat entire book as one chapter
        setChapters(["CHAPTER 1 - Full Book"]);
        setBookContent(content);
        setBookTitle(extractTitle(bookFile));
        setChapter(1);
        
        // Store all content for future chapter navigation
        setAllContent([content]);
      } else {
        // Split by chapters
        const chapterContents = content.split(chapterRegex).slice(1);
        
        // Set book data
        setBookTitle(extractTitle(bookFile));
        setChapters(chapterTitles);
        setAllContent(chapterContents);
        
        // Set initial chapter
        if (chapterContents.length > 0) {
          setBookContent(chapterContents[0]);
          setChapter(1);
        }
      }
      
      // Ensure loading state is updated
      setTimeout(() => {
        setBookAnimation(false);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing book content:', error);
      setLoadError('Error processing book content. Please try again.');
      setIsLoading(false);
      setBookAnimation(false);
    }
  };
  
  // Load book based on route param
  useEffect(() => {
    const bookIndex = bookId ? parseInt(bookId) - 1 : 0;
    if (bookIndex >= 0 && bookIndex < books.length) {
      loadBook(bookIndex);
    } else {
      navigate('/books/1');
    }
  }, [bookId, books, navigate]);
  
  // Handle chapter navigation
  const goToChapter = (chapterNum: number) => {
    if (chapterNum >= 1 && chapterNum <= chapters.length) {
      setBookAnimation(true);
      
      setTimeout(() => {
        if (chapters.length === 1 && chapters[0] === "CHAPTER 1 - Full Book") {
          // No need to change content for single-chapter books
          setChapter(1);
        } else {
          // For multi-chapter books, use the cached content
          if (allContent.length >= chapterNum) {
            setBookContent(allContent[chapterNum - 1]);
            setChapter(chapterNum);
          }
        }
        
        // Scroll to top
        contentRef.current?.scrollTo(0, 0);
        setBookAnimation(false);
      }, 500);
    }
  };
  
  const goToBook = (bookNum: number) => {
    if (bookNum >= 1 && bookNum <= books.length) {
      navigate(`/books/${bookNum}`);
    }
  };
  
  return (
    <div className="book-reader-container py-6 px-4 sm:px-6">
      {/* Floating magical elements */}
      <div className="floating-elements">
        <div className="floating-item slower" style={{ top: '5%', left: '10%' }}>✨</div>
        <div className="floating-item slow" style={{ top: '12%', right: '15%' }}>⚡</div>
        <div className="floating-item rotate" style={{ top: '30%', left: '5%' }}>🪄</div>
        <div className="floating-item" style={{ bottom: '25%', right: '10%' }}>🦉</div>
        <div className="floating-star twinkle" style={{ top: '8%', left: '25%' }}></div>
        <div className="floating-star twinkle-delayed" style={{ top: '15%', left: '35%' }}></div>
        <div className="floating-star twinkle-slow" style={{ top: '10%', left: '50%' }}></div>
      </div>
      
      {/* Book navigation */}
      <div className="books-nav flex justify-center space-x-4 mb-8 flex-wrap gap-2">
        {books.map((book, index) => (
          <button
            key={index}
            onClick={() => goToBook(index + 1)}
            className={`book-tab ${parseInt(bookId || '1') === index + 1 ? 'active' : ''}`}
          >
            Book {index + 1}
          </button>
        ))}
      </div>
      
      <div className="max-w-5xl mx-auto">
        {/* Book title */}
        <h1 className="book-title text-3xl md:text-4xl mb-6 text-center">{bookTitle}</h1>
        
        {/* Error display */}
        {loadError && (
          <div className="bg-red-900/70 text-white p-4 rounded-md mb-6 border border-red-500">
            <h3 className="text-xl font-bold mb-2">Error Loading Book</h3>
            <p>{loadError}</p>
            <p className="mt-4">
              Make sure the book files are in the correct location: <code>/public/books/</code>
            </p>
            <button 
              onClick={() => loadBook(parseInt(bookId || '1') - 1)}
              className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Chapter navigation - only show if we have chapters and no errors */}
        {!loadError && chapters.length > 0 && (
          <div className="chapter-nav mb-6">
            <label className="mr-2">Chapter:</label>
            <select 
              value={chapter}
              onChange={(e) => goToChapter(parseInt(e.target.value))}
              className="chapter-select"
            >
              {chapters.map((chapterTitle, index) => (
                <option key={index} value={index + 1}>
                  {chapterTitle.trim()}
                </option>
              ))}
            </select>
            
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => goToChapter(chapter - 1)}
                disabled={chapter <= 1}
                className="nav-btn"
              >
                Previous Chapter
              </button>
              <button 
                onClick={() => goToChapter(chapter + 1)}
                disabled={chapter >= chapters.length}
                className="nav-btn"
              >
                Next Chapter
              </button>
            </div>
          </div>
        )}
        
        {/* Book content */}
        <div className="book-content-container">
          {isLoading ? (
            <div className="loading-container text-center py-12">
              <div className="loading-wand">
                <div className="loading-spark"></div>
              </div>
              <p className="loading-text mt-4">Summoning magical pages...</p>
            </div>
          ) : !loadError ? (
            <div 
              ref={contentRef}
              className="book-content"
            >
              {chapters.length > 0 && (
                <h2 className="chapter-title mb-6">{chapters[chapter - 1]}</h2>
              )}
              {bookContent.split('\n\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="book-paragraph">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-red-400">Unable to display book content</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="back-btn"
          >
            Return to Chat
          </button>
        </div>
      </div>

      {/* Add the AI Assistant */}
      {!isLoading && !loadError && bookContent && (
        <BookAIAssistant 
          bookContent={bookContent} 
          bookTitle={bookTitle} 
        />
      )}
    </div>
  );
} 