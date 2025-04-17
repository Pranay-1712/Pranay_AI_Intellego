import Groq from 'groq-sdk';
import { bookProcessor } from './bookProcessor';

// Initialize the Groq client with the API key
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
if (!apiKey) {
  console.error('Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file.');
}

// Create Groq client with browser support enabled
const client = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true // Allow browser usage
});

// Define system prompts for each character
const SYSTEM_PROMPTS = {
  dumbledore: `You are Albus Dumbledore answering Harry Potter questions.

CRITICAL RULES:
- ONLY use the book excerpts provided below - no outside knowledge
- If information isn't in the excerpts, say "I don't have that information"
- Only discuss the 4 Harry Potter books provided
- For non-Harry Potter questions say "I can only discuss Harry Potter books"`,

  dobby: `You are Dobby the house-elf answering Harry Potter questions.

CRITICAL RULES:
- ONLY use the book excerpts provided below - no outside knowledge
- Refer to yourself as Dobby in third person
- If information isn't in the excerpts, say "Dobby doesn't know that"
- Only discuss the 4 Harry Potter books provided
- For non-Harry Potter questions say "Dobby only knows Harry Potter books"`,

  snape: `You are Professor Severus Snape answering Harry Potter questions.

CRITICAL RULES:
- ONLY use the book excerpts provided below - no outside knowledge
- Use cold, precise language
- If information isn't in the excerpts, say "That information is not in the books"
- Only discuss the 4 Harry Potter books provided
- For non-Harry Potter questions say "I only discuss Potter books"`,

  standard: `You are a Harry Potter assistant.

CRITICAL RULES:
- ONLY use the book excerpts provided below - no outside knowledge
- Use clear, simple language
- If information isn't in the excerpts, say "That information is not available"
- Only discuss the 4 Harry Potter books provided
- For non-Harry Potter questions say "I only discuss Harry Potter books"`
};

// Store book context once loaded - this is now redundant as bookProcessor loads it once
let bookContextCache: string | null = null;
let contextLoadAttempts = 0;
const MAX_CONTEXT_LOAD_ATTEMPTS = 3;

/**
 * Get Harry Potter book context
 * Uses the singleton bookProcessor which loads books once at startup
 */
export async function getBookContext(): Promise<string> {
  // Return cached context if available
  if (bookContextCache) {
    return bookContextCache;
  }

  // Avoid infinite retries
  if (contextLoadAttempts >= MAX_CONTEXT_LOAD_ATTEMPTS) {
    throw new Error("Maximum book context load attempts reached");
  }
  
  contextLoadAttempts++;
  
  try {
    console.log("Attempting to get book context from bookProcessor...");
    
    // Get pre-loaded book context from bookProcessor
    bookContextCache = await bookProcessor.getFullContext();
    
    if (!bookContextCache || bookContextCache.length < 100) {
      console.error("Received invalid book context - too short or empty");
      throw new Error("Invalid book context received");
    }
    
    console.log(`Successfully loaded book context (${bookContextCache.length} characters)`);
    return bookContextCache;
  } catch (error) {
    console.error("Error getting book context:", error);
    
    // Try to force reload books if they failed to load initially
    if (contextLoadAttempts < MAX_CONTEXT_LOAD_ATTEMPTS) {
      console.log(`Retrying book context load (attempt ${contextLoadAttempts}/${MAX_CONTEXT_LOAD_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a second before retrying
      return getBookContext(); // Recursive retry
    }
    
    throw new Error("Failed to get book context after multiple attempts");
  }
}

/**
 * Get response from Groq API for Harry Potter related queries
 */
export async function getGroqResponse(
  message: string, 
  conversationHistory: Array<{role: 'user' | 'assistant' | 'system', content: string}> = [],
  character: string = 'standard'
): Promise<string> {
  try {
    // Get the book context only once
    let bookContext: string;
    try {
      bookContext = await getBookContext();
    } catch (error) {
      console.error("Failed to get book context:", error);
      return "I'm having trouble accessing the Harry Potter books right now. Please check that the books are loaded correctly and try again.";
    }

    // The complete system prompt with character-specific instructions and book content
    const characterPrompt = SYSTEM_PROMPTS[character as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.standard;
    const fullSystemPrompt = `${characterPrompt}\n\nHARRY POTTER BOOK EXCERPTS:\n${bookContext}`;

    // Make request to Groq API with retry logic
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        console.log("Sending request to Groq API...");
        const chatCompletion = await client.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: fullSystemPrompt
            },
            ...conversationHistory.slice(-4), // Only send recent history to save tokens
            { 
              role: 'user', 
              content: message 
            }
          ],
          model: 'llama3-8b-8192', // Using Llama 3 model
          temperature: 0.3,
          max_tokens: 1024, // Reduced for shorter responses
          top_p: 0.5,
          frequency_penalty: 0.5
        });

        const responseContent = chatCompletion.choices[0].message.content || "I can't find that information in the Harry Potter books.";
        console.log("Received response from Groq API");
        return responseContent;
      } catch (error) {
        console.error(`Groq API request failed (attempt ${attempts + 1}/${maxAttempts}):`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error("Failed after multiple attempts");
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return "I'm having trouble connecting to my knowledge base. Please try again later.";
  }
} 