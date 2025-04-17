import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookAIAssistant } from '@/components/BookAIAssistant';

interface Book {
  id: string;
  title: string;
  author: string;
  filename: string;
  cover: string;
  description: string;
}

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [bookContent, setBookContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('collection');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Define the book data
    const bookData: Book[] = [
      {
        id: "hp1",
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        filename: "J. K. Rowling - Harry Potter 1 - Sorcerer's Stone (1).txt",
        cover: "/book-covers/hp1.jpg",
        description: "Harry Potter's life is miserable. His parents are dead and he's stuck with his heartless relatives, who force him to live in a tiny closet under the stairs. But his fortune changes when he receives a letter that tells him the truth about himself: he's a wizard."
      },
      {
        id: "hp2",
        title: "Harry Potter and the Chamber of Secrets",
        author: "J.K. Rowling",
        filename: "J. K. Rowling - Harry Potter 2 - The Chamber Of Secrets.txt",
        cover: "/book-covers/hp2.jpg",
        description: "The Dursleys were so mean and hideous that summer that all Harry Potter wanted was to get back to the Hogwarts School for Witchcraft and Wizardry. But just as he's packing his bags, Harry receives a warning from a strange, impish creature named Dobby who says that if Harry Potter returns to Hogwarts, disaster will strike."
      },
      {
        id: "hp3",
        title: "Harry Potter and the Prisoner of Azkaban",
        author: "J.K. Rowling",
        filename: "J. K. Rowling - Harry Potter 3 - Prisoner of Azkaban.txt",
        cover: "/book-covers/hp3.jpg",
        description: "Harry Potter's third year at Hogwarts is full of new dangers. A convicted murderer, Sirius Black, has broken out of Azkaban prison, and it seems he's after Harry. Now Hogwarts is being patrolled by the dementors, the Azkaban guards who are hunting Sirius."
      },
      {
        id: "hp4",
        title: "Harry Potter and the Goblet of Fire",
        author: "J.K. Rowling",
        filename: "J. K. Rowling - Harry Potter 4 - The Goblet of Fire.txt",
        cover: "/book-covers/hp4.jpg",
        description: "Harry Potter is midway through his training as a wizard and his coming of age. Harry wants to get away from the pernicious Dursleys and go to the International Quidditch Cup. He wants to find out about the mysterious event that's supposed to take place at Hogwarts this year."
      }
    ];
    
    setBooks(bookData);
  }, []);

  const fetchBookContent = async (filename: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo('');
      
      // Show log to help with debugging
      let debugLog = `Fetching book: ${filename}\n`;
      debugLog += `Current URL: ${window.location.href}\n`;
      debugLog += `Base URL: ${window.location.origin}\n\n`;
      
      // Try different possible paths including the API path
      const possiblePaths = [
        // API endpoint (recommended)
        `/api/books/${encodeURIComponent(filename)}`,
        
        // Direct file access methods
        `/books/${filename}`,
        `books/${filename}`,
        `../books/${filename}`,
        `${window.location.origin}/books/${filename}`,
        `/public/books/${filename}`
      ];
      
      debugLog += "Trying paths in this order:\n";
      possiblePaths.forEach((path, i) => {
        debugLog += `${i+1}. ${path}\n`;
      });
      
      let success = false;
      let errorMessage = '';
      
      // Try each path until one works
      for (const path of possiblePaths) {
        try {
          debugLog += `\nAttempting to fetch from: ${path}\n`;
          
          const response = await fetch(path, {
            method: 'GET',
            headers: {
              'Accept': 'text/plain',
              'Cache-Control': 'no-cache'
            }
          });
          
          debugLog += `Status: ${response.status} ${response.statusText}\n`;
          
          if (response.ok) {
            // For API endpoint, we might get JSON or text depending on success/error
            const contentType = response.headers.get('content-type');
            let text;
            
            if (contentType && contentType.includes('application/json')) {
              const jsonData = await response.json();
              if (jsonData.error) {
                errorMessage += `API Error: ${jsonData.error} - ${jsonData.details || ''}\n`;
                debugLog += `❌ API Error: ${jsonData.error}\n`;
                continue;
              }
              text = jsonData.content || '';
            } else {
              text = await response.text();
            }
            
            if (text) {
              setBookContent(text);
              success = true;
              debugLog += `✅ Success! Book loaded (${text.length} chars)\n`;
              break;
            } else {
              errorMessage += `Empty content from ${path}\n`;
              debugLog += `⚠️ Empty content\n`;
            }
          } else {
            errorMessage += `Failed to fetch from ${path}: ${response.status} ${response.statusText}\n`;
            debugLog += `❌ Failed\n`;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errorMessage += `Error fetching from ${path}: ${message}\n`;
          debugLog += `⚠️ Error: ${message}\n`;
        }
      }
      
      setDebugInfo(debugLog);
      
      if (!success) {
        // Add more helpful tips to the error message
        console.error('All fetch attempts failed:', errorMessage);
        setError(
          "Could not load the book. Try the following:\n" +
          "1. Make sure the book files are in the 'books' folder\n" +
          "2. Start the API server with 'node api/index.js'\n" +
          "3. Check browser developer console for more details"
        );
        setBookContent('');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchBookContent:', error);
      const message = error instanceof Error ? error.message : String(error);
      setError(`Failed to load book: ${message}`);
      setBookContent('');
      setIsLoading(false);
    }
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setActiveTab('reader');
    
    const book = books.find(b => b.id === bookId);
    if (book) {
      fetchBookContent(book.filename);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const startServer = () => {
    window.open("/start-server.html", "_blank");
  };
  
  // Get the selected book title
  const selectedBookTitle = selectedBook 
    ? books.find(b => b.id === selectedBook)?.title || ""
    : "";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-violet-600 text-transparent bg-clip-text">
        Magical Books Collection
      </h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collection">Book Collection</TabsTrigger>
          <TabsTrigger value="reader">Book Reader</TabsTrigger>
        </TabsList>
        
        <TabsContent value="collection" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card 
                key={book.id}
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
                onClick={() => handleBookSelect(book.id)}
              >
                <div className="h-64 overflow-hidden bg-gray-100">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x600/45115/ffffff?text=Book+Cover';
                    }}
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="line-clamp-3">{book.description}</p>
                </CardContent>
                <CardFooter>
                  <button 
                    className="rounded-md px-4 py-2 bg-purple-600 text-white w-full hover:bg-purple-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookSelect(book.id);
                    }}
                  >
                    Read Now
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reader" className="mt-6">
          {selectedBook ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                </div>
              ) : error ? (
                <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p className="font-bold">Error Loading Book</p>
                  <p className="whitespace-pre-line">{error}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        const book = books.find(b => b.id === selectedBook);
                        if (book) fetchBookContent(book.filename);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Try Again
                    </button>
                    
                    <button 
                      onClick={() => window.open("/test-book-access.html", "_blank")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Test Book Access
                    </button>
                    
                    <button 
                      onClick={startServer}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Start API Server
                    </button>
                  </div>
                  
                  {debugInfo && (
                    <div className="mt-4">
                      <details>
                        <summary className="cursor-pointer font-semibold">Technical Debug Info</summary>
                        <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto whitespace-pre-wrap">{debugInfo}</pre>
                      </details>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {books.find(b => b.id === selectedBook)?.title}
                  </h2>
                  <div className="max-h-[70vh] overflow-y-auto p-4 bg-amber-50 rounded-md font-serif leading-relaxed whitespace-pre-line">
                    {bookContent || 'Select a book to start reading'}
                  </div>
                  
                  {/* Render the AI Assistant when book content is loaded */}
                  {bookContent && <BookAIAssistant bookContent={bookContent} bookTitle={selectedBookTitle} />}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">Please select a book from the collection to start reading</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 