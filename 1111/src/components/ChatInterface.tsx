import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getGroqResponse } from '../lib/groqService';
import { bookProcessor } from '../lib/bookProcessor';
import { sendChatRequest } from '../api/chat';

export type CharacterType = 'dumbledore' | 'dobby' | 'snape' | 'standard';

// Types for messages
type MessageType = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

type ResponseType = 'freeform' | 'structured';

export function ChatInterface() {
  // State for conversation
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      content: "Welcome to the Harry Potter Storybook AI. I provide information directly from the first four Harry Potter books. Ask me any question about characters, places, events, or magical concepts from these books.",
      role: 'assistant'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [sessionId] = useState(() => uuidv4());
  const [responseType, setResponseType] = useState<ResponseType>('freeform');
  const [character, setCharacter] = useState<CharacterType>('dumbledore');
  const [magicEffect, setMagicEffect] = useState<string | null>(null);
  const [quillActive, setQuillActive] = useState(false);
  const [spellEffects, setSpellEffects] = useState<{x: number, y: number, type: string}[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Check if books are loaded on initial mount (they should already be loading in the background)
  useEffect(() => {
    const checkBooksLoaded = async () => {
      try {
        setIsLoadingBooks(true);
        setLoadingError(null);
        
        // Run a simple query to verify books are loaded
        await bookProcessor.getFullContext();
        
        setIsLoadingBooks(false);
        // Set welcome message after books are loaded
        setWelcomeMessage();
      } catch (error) {
        console.error("Error checking books:", error);
        setLoadingError("Couldn't access the Harry Potter books. Please refresh the page.");
        setIsLoadingBooks(false);
      }
    };
    
    checkBooksLoaded();
  }, []);
  
  // Set welcome message based on selected character
  const setWelcomeMessage = () => {
    let welcomeMessage = "";
    
    switch(character) {
      case 'dumbledore':
        welcomeMessage = "Welcome to the Harry Potter Storybook AI. I am Professor Dumbledore. What would you like to know about the first four books?";
        break;
      case 'dobby':
        welcomeMessage = "Dobby welcomes you to Harry Potter Storybook! Dobby can answer questions about Harry Potter books!";
        break;
      case 'snape':
        welcomeMessage = "I am Professor Snape. I can answer your questions about the Potter books.";
        break;
      case 'standard':
        welcomeMessage = "Welcome to the Harry Potter Storybook AI. I can answer questions about the first four books.";
        break;
    }
    
    setMessages([{
      id: '1',
      content: welcomeMessage,
      role: 'assistant'
    }]);
  };
  
  // Change welcome message when character changes
  useEffect(() => {
    // Skip if books are still loading
    if (isLoadingBooks) return;
    
    // Skip if there are already messages beyond the welcome message
    if (messages.length > 1) return;
    
    setWelcomeMessage();
  }, [character, isLoadingBooks]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle key events in the textarea
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !isLoadingBooks) {
        handleSubmit(e);
      }
    }
  };

  // Create magical effect on element click
  const createMagicalEffect = (e: React.MouseEvent, type: string) => {
    // Get click position
    const x = e.clientX;
    const y = e.clientY;
    
    // Add new spell effect
    setSpellEffects(prev => [...prev, {x, y, type}]);
    
    // Remove effect after animation completes
    setTimeout(() => {
      setSpellEffects(prev => prev.filter(effect => !(effect.x === x && effect.y === y)));
    }, 2000);
  };

  // Quill animation on input focus
  const activateQuill = () => setQuillActive(true);
  const deactivateQuill = () => setQuillActive(false);
  
  // Handle character change
  const handleCharacterChange = (newCharacter: CharacterType) => {
    setCharacter(newCharacter);
    // Create a magical effect when changing character
    setMagicEffect('cast');
    setTimeout(() => setMagicEffect(null), 1000);
    // Focus back on input after changing character
    inputRef.current?.focus();
    
    // Reset messages to just the welcome message if this is a new conversation
    if (messages.length <= 1) {
      setWelcomeMessage();
    }
  };
  
  // Handle form submission with magic effect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading || isLoadingBooks) return;
    
    // Trigger magic effect
    setMagicEffect('cast');
    setTimeout(() => setMagicEffect(null), 1500);
    
    // Add user message
    const userMessage: MessageType = {
      id: uuidv4(),
      content: input,
      role: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get only the last few messages to keep context concise
      const recentMessages = messages.slice(-4);
      
      // Format previous messages for the Groq API
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Get response from Groq API based on character
      let prompt = input;
      
      // For structured responses, add formatting instructions
      if (responseType === 'structured') {
        prompt = `Provide a structured response to: ${input}. Keep it concise.`;
      }
      
      // Get response from API with selected character voice
      const response = await getGroqResponse(prompt, conversationHistory, character);
      
      // Add assistant message
      const assistantMessage: MessageType = {
        id: uuidv4(),
        content: response,
        role: 'assistant'
      };
      
      // Small delay for dramatic effect
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
      }, 500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: MessageType = {
        id: uuidv4(),
        content: "I'm sorry, I couldn't process your request. Please try again.",
        role: 'assistant'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  // Character icon mapping
  const characterIcons = {
    dumbledore: '🧙‍♂️',
    dobby: '🧝',
    snape: '⚗️',
    standard: '🤖'
  };

  // Function to run diagnostics
  const runDiagnostics = async () => {
    setDiagnosticInfo('Running book loading diagnostics...');
    
    try {
      // Test book file access
      const bookFiles = [
        'J. K. Rowling - Harry Potter 1 - Sorcerer\'s Stone (1).txt',
        'J. K. Rowling - Harry Potter 2 - The Chamber Of Secrets.txt',
        'J. K. Rowling - Harry Potter 3 - Prisoner of Azkaban.txt',
        'J. K. Rowling - Harry Potter 4 - The Goblet of Fire.txt'
      ];
      
      const results = [];
      
      for (const file of bookFiles) {
        try {
          const url = `${window.location.origin}/books/${file}`;
          results.push(`Testing ${url}...`);
          
          const response = await fetch(url);
          
          if (response.ok) {
            const text = await response.text();
            results.push(`✅ Successfully loaded ${file} (${text.length} characters)`);
          } else {
            results.push(`❌ Failed to load ${file} - Status: ${response.status}`);
          }
        } catch (error) {
          results.push(`❌ Error accessing ${file}: ${(error as Error).message}`);
        }
      }
      
      // Try to access the Groq API
      results.push('Testing Groq API connection...');
      try {
        const testMessage = await sendChatRequest({
          message: 'Test message',
          sessionId: 'diagnostic-' + Date.now(),
          responseType: 'freeform'
        });
        
        if (testMessage.response) {
          results.push('✅ Successfully connected to Groq API');
        } else {
          results.push('⚠️ Received empty response from Groq API');
        }
      } catch (error) {
        results.push(`❌ Error connecting to Groq API: ${(error as Error).message}`);
      }
      
      setDiagnosticInfo(results.join('\n'));
    } catch (error) {
      setDiagnosticInfo(`Error running diagnostics: ${(error as Error).message}`);
    }
  };

  // Show error screen if books failed to load
  if (loadingError) {
    return (
      <div className="app-container w-full h-full flex flex-col items-center justify-center">
        <div className="error-container text-center p-8 bg-gray-800/80 rounded-lg max-w-md">
          <div className="text-4xl mb-4">📚❌</div>
          <h2 className="text-xl font-bold text-white mb-4">Magic Books Unavailable</h2>
          <p className="text-gray-300 mb-6">{loadingError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container relative w-full h-full flex flex-col">
      {/* Magical overlay */}
      <div className="magical-overlay"></div>
      
      {/* Magic effect overlay */}
      {magicEffect === 'cast' && (
        <div className="magic-effect-overlay">
          <div className="magic-effect-bg"></div>
          <div className="magic-circle"></div>
        </div>
      )}
      
      {/* Books loading overlay */}
      {isLoadingBooks && (
        <div className="fixed inset-0 flex items-center justify-center bg-purple-900/70 z-50">
          <div className="text-center p-8 rounded-lg bg-gray-800/80">
            <div className="loading-wand mb-4">
              <div className="loading-spark"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Magical Books</h2>
            <p className="text-gray-300">Retrieving the first four Harry Potter books...</p>
          </div>
        </div>
      )}
      
      {/* On-click spell effects */}
      {spellEffects.map((effect, index) => (
        <div 
          key={`${effect.x}-${effect.y}-${index}`}
          className="spell-effect"
          style={{ 
            left: effect.x, 
            top: effect.y
          }}
        >
          {effect.type === 'star' && (
            <div className="star-effect"></div>
          )}
          {effect.type === 'wand' && (
            <div className="wand-effect"></div>
          )}
          {effect.type === 'potion' && (
            <div className="potion-effect"></div>
          )}
        </div>
      ))}
      
      {/* Floating magical elements - now interactive */}
      <div className="floating-elements">
        <div 
          className="floating-item slower"
          style={{ top: '8%', left: '12%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        >✨</div>
        <div 
          className="floating-item slow"
          style={{ top: '15%', right: '18%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        >⚡</div>
        <div 
          className="floating-item rotate"
          style={{ top: '40%', left: '8%' }}
          onClick={e => createMagicalEffect(e, 'wand')}
        >🪄</div>
        <div 
          className="floating-item"
          style={{ bottom: '30%', right: '15%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        >🦉</div>
        <div 
          className="floating-item slow"
          style={{ bottom: '15%', left: '20%' }}
          onClick={e => createMagicalEffect(e, 'wand')}
        >🧙</div>
        <div 
          className="floating-item magical"
          style={{ top: '22%', left: '25%', fontSize: '1.25rem' }}
          onClick={e => createMagicalEffect(e, 'star')}
        >🏰</div>
        <div 
          className="floating-item magical"
          style={{ bottom: '45%', right: '10%', fontSize: '1.25rem' }}
          onClick={e => createMagicalEffect(e, 'star')}
        >🧹</div>
        
        {/* Interactive potions with tooltips */}
        <div 
          className="floating-item magical-tooltip"
          style={{ top: '35%', left: '75%' }}
          data-tooltip="Polyjuice Potion - Click to use!"
          onClick={e => createMagicalEffect(e, 'potion')}
        >
          <div style={{ fontSize: '1.5rem' }}>🧪</div>
        </div>
        <div 
          className="floating-item magical-tooltip"
          style={{ top: '55%', left: '18%' }}
          data-tooltip="Felix Felicis - Click for good luck!"
          onClick={e => createMagicalEffect(e, 'potion')}
        >
          <div style={{ fontSize: '1.5rem' }}>🧪</div>
        </div>
        
        {/* Animated stars - now clickable */}
        <div 
          className="floating-star twinkle"
          style={{ top: '10%', left: '30%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        ></div>
        <div 
          className="floating-star twinkle-delayed"
          style={{ top: '20%', left: '40%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        ></div>
        <div 
          className="floating-star twinkle-slow"
          style={{ top: '15%', left: '60%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        ></div>
        <div 
          className="floating-star twinkle-delayed"
          style={{ top: '30%', left: '70%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        ></div>
        <div 
          className="floating-star twinkle-slow"
          style={{ top: '40%', left: '20%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        ></div>
        <div 
          className="floating-star twinkle"
          style={{ top: '50%', left: '80%' }}
          onClick={e => createMagicalEffect(e, 'star')}
        ></div>
      </div>
      
      {/* Chat header with title */}
      <div className="text-center my-5">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-violet-500 text-transparent bg-clip-text">
          Harry Potter Storybook
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Ask questions about the magical world of Harry Potter
        </p>
      </div>
      
      {/* Main content */}
      <main className="main-content">
        <div className="chat-wrapper">
          {/* Chat container */}
          <div className="chat-container custom-scrollbar">
            <div className="messages-list flex-grow overflow-y-auto px-4 py-2">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`message-content max-w-3xl ${message.role === 'user' ? 'bg-purple-700/40' : 'bg-gray-800/60'} rounded-lg p-3`}>
                    <div className="flex items-start">
                      <div 
                        className={`avatar flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full mr-3 ${message.role === 'user' ? 'bg-purple-600' : 'bg-gray-700'}`}
                        onClick={e => createMagicalEffect(e, message.role === 'user' ? 'star' : 'wand')}
                      >
                        {message.role === 'user' ? 'U' : character === 'standard' ? 'AI' : 
                         character === 'dumbledore' ? 'AD' : 
                         character === 'dobby' ? 'D' : 'SS'}
                      </div>
                      <div 
                        className="message-text"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content
                            .replace(/\n/g, '<br>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a64aff">$1</strong>')
                            .replace(/# (.*?)(\n|$)/g, '<h3 style="color:#f1d78d;font-size:1.25rem;font-weight:bold;margin-bottom:0.5rem">$1</h3>')
                            .replace(/## (.*?)(\n|$)/g, '<h4 style="color:#f1d78d;font-size:1.1rem;font-weight:bold;margin-bottom:0.3rem">$1</h4>')
                            .replace(/- (.*?)(\n|$)/g, '<div style="margin-left:1rem;margin-bottom:0.5rem;position:relative"><span style="position:absolute;left:-1rem;color:#a64aff">•</span>$1</div>')
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="loading-indicator flex justify-center my-4">
                  <div className="loading-bubbles">
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="loading-wave"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="input-area">
            {/* Response type selector */}
            <div className="response-type">
              <div className="response-label">Response Format:</div>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="freeform"
                    name="responseType"
                    value="freeform"
                    checked={responseType === 'freeform'}
                    onChange={() => setResponseType('freeform')}
                  />
                  <label htmlFor="freeform">Freeform</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="structured"
                    name="responseType"
                    value="structured"
                    checked={responseType === 'structured'}
                    onChange={() => setResponseType('structured')}
                  />
                  <label htmlFor="structured">Structured</label>
                </div>
                <button 
                  className="diagnostic-button ml-4" 
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  title="Toggle diagnostics panel"
                >
                  🔍
                </button>
              </div>
            </div>
            
            {/* Diagnostics panel */}
            {showDiagnostics && (
              <div className="diagnostics-panel">
                <div className="diagnostics-header">
                  <h3>Book Loading Diagnostics</h3>
                  <button onClick={runDiagnostics}>Run Diagnostics</button>
                </div>
                <pre className="diagnostics-output">{diagnosticInfo}</pre>
              </div>
            )}
            
            <form className="message-form p-3 bg-gray-800/20 rounded-b-lg" onSubmit={handleSubmit}>
              <div className="input-container relative">
                {quillActive && <div className="quill absolute left-2 top-1/2 transform -translate-y-1/2"></div>}
                <textarea
                  ref={inputRef}
                  className="message-input w-full p-4 rounded-lg bg-gray-800/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoadingBooks ? "Loading books..." : 
                              `Ask ${character === 'dumbledore' ? 'Professor Dumbledore' : 
                              character === 'dobby' ? 'Dobby' : 
                              character === 'snape' ? 'Professor Snape' : 
                              'the AI'} about Harry Potter...`}
                  onFocus={activateQuill}
                  onBlur={deactivateQuill}
                  disabled={isLoading || isLoadingBooks}
                  rows={3}
                />
                
                {/* Character selector button */}
                <div className="absolute right-28 bottom-4">
                  <button 
                    type="button"
                    className="character-toggle px-3 py-1 bg-gray-700/60 hover:bg-gray-600/60 rounded-lg text-white flex items-center"
                    onClick={() => {
                      const newChar = character === 'dumbledore' ? 'dobby' : 
                                      character === 'dobby' ? 'snape' : 
                                      character === 'snape' ? 'standard' : 'dumbledore';
                      handleCharacterChange(newChar);
                    }}
                    disabled={isLoadingBooks}
                  >
                    {character === 'dumbledore' ? '🧙‍♂️' : 
                     character === 'dobby' ? '🧝' : 
                     character === 'snape' ? '⚗️' : '🤖'}
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="submit-button absolute right-4 bottom-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  disabled={isLoading || !input.trim() || isLoadingBooks}
                >
                  {isLoading ? <span className="spinner mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span> : null}
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

