import { tokenize } from '../lib/tokenizer';
import { nlpProcessor } from '../lib/nlp';
import { bookProcessor } from '../lib/bookProcessor';
import { getGroqResponse } from '../lib/groqService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  responseType?: 'structured' | 'freeform';
}

export interface ChatResponse {
  response: string;
  context?: string;
}

// In-memory storage for conversations
const conversations = new Map<string, Message[]>();

// Book content will be managed by bookProcessor
const books = bookProcessor;
let booksLoaded = false;
let bookLoadAttempts = 0;
const MAX_BOOK_LOAD_ATTEMPTS = 3;

// Initialize book content
async function loadBooks(): Promise<boolean> {
  if (booksLoaded) return true;
  
  // Avoid infinite retries
  if (bookLoadAttempts >= MAX_BOOK_LOAD_ATTEMPTS) {
    console.error(`Failed to load books after ${MAX_BOOK_LOAD_ATTEMPTS} attempts`);
    throw new Error('Failed to load book content after multiple attempts');
  }
  
  bookLoadAttempts++;
  console.log(`Attempting to load books (attempt ${bookLoadAttempts}/${MAX_BOOK_LOAD_ATTEMPTS})...`);
  
  try {
    const loadResult = await bookProcessor.loadBooks();
    booksLoaded = true;
    console.log('Books loaded successfully');
    return loadResult;
  } catch (error) {
    console.error('Error loading books:', error);
    
    // Try again if we haven't reached the max attempts
    if (bookLoadAttempts < MAX_BOOK_LOAD_ATTEMPTS) {
      console.log('Retrying book load...');
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadBooks(); // Recursive retry
    }
    
    throw new Error('Failed to load book content');
  }
}

// Function to search for relevant content in the books
function searchBooks(query: string) {
  return bookProcessor.searchBooks(query);
}

// Main chat function that combines book content with Groq API
export async function sendChatRequest(request: ChatRequest): Promise<ChatResponse> {
  try {
    const { message, sessionId, responseType } = request;
    
    // Input validation
    if (!message?.trim()) {
      throw new Error('Message is required and cannot be empty');
    }
    
    if (!sessionId?.trim()) {
      throw new Error('Session ID is required');
    }
    
    // Ensure books are loaded
    if (!booksLoaded) {
      try {
        await loadBooks();
      } catch (loadError) {
        console.error('Book loading failed:', loadError);
        return {
          response: "I'm having trouble loading the Harry Potter books. This could be due to network issues or missing files. Please try refreshing the page or check your connection.",
          context: "Book loading error"
        };
      }
    }
    
    // Create or retrieve conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    
    const conversationHistory = conversations.get(sessionId) || [];
    
    // Process message with NLP
    const processedQuery = nlpProcessor.processText(message).join(' ');
    
    // Search through books for relevant content
    const searchResults = await bookProcessor.searchBooks(processedQuery);
    
    // If we found relevant book content, use it to enhance the Groq API prompt
    let promptWithContext = message;
    let bookContexts: string[] = [];
    
    if (searchResults.length > 0) {
      // Extract context from most relevant results (up to 3)
      bookContexts = searchResults.slice(0, 3).map((result, index) => 
        `Passage ${index + 1} from ${result.book}:\n${result.context}`
      );
      
      // Add book context to prompt
      promptWithContext = `
I want you to answer based on this context from the Harry Potter books:
${bookContexts.join('\n\n')}

User question: ${message}
`;
      
      // Add contexts to NLP processor for future reference
      searchResults.forEach(result => {
        nlpProcessor.addContext({
          book: result.book,
          chapter: 'Unknown',
          content: result.context,
          relevance: result.relevance
        });
      });
    } else {
      console.log('No relevant search results found in books for query:', message);
      // Use a more general prompt for the API
      promptWithContext = `
The user has asked about Harry Potter books 1-4. Please answer their question if possible:
"${message}"

If this is not about Harry Potter books 1-4, kindly explain that you only have information about the first four Harry Potter books.
`;
    }
    
    // Format message based on response type
    if (responseType === 'structured') {
      promptWithContext = `Please provide a structured response with headers and bullet points to the following question, based on Harry Potter books content:\n\n${promptWithContext}`;
    }
    
    // Get enhanced response from Groq API with book context
    let apiResponse;
    try {
      apiResponse = await getGroqResponse(promptWithContext);
    } catch (apiError) {
      console.error('Error getting response from Groq API:', apiError);
      // Fallback to direct book context if API fails
      if (searchResults.length > 0) {
        apiResponse = `I found this in the Harry Potter books:\n\n${bookContexts.join('\n\n')}`;
      } else {
        apiResponse = "I'm sorry, I couldn't connect to my knowledge base. Please try again later.";
      }
    }
    
    // Update conversation history
    const conversation = conversations.get(sessionId) || [];
    
    conversation.push({
      role: 'user',
      content: message,
      context: searchResults[0]?.context
    });
    
    conversation.push({
      role: 'assistant',
      content: apiResponse,
      context: searchResults[0]?.context
    });
    
    // Limit conversation history to last 20 messages
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }
    
    conversations.set(sessionId, conversation);
    
    return {
      response: apiResponse,
      context: searchResults[0]?.context
    };
  } catch (error) {
    console.error('Error processing chat request:', error);
    return {
      response: "I'm experiencing technical difficulties. This might be related to book loading or API connection issues. Please try refreshing the page or try again later.",
      context: "Error: " + (error instanceof Error ? error.message : "Unknown error")
    };
  }
}