import { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize, Maximize, BookOpen, Copy, CheckCircle2 } from 'lucide-react';
import { getGroqResponse } from '@/lib/groqService';

interface BookAIAssistantProps {
  bookContent: string;
  bookTitle: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Character types that match the groqService
type CharacterType = 'dumbledore' | 'dobby' | 'snape' | 'standard';

// Character display info
const characters: Record<CharacterType, { name: string, icon: string, description: string }> = {
  standard: { 
    name: "Assistant", 
    icon: "🧙", 
    description: "A helpful Harry Potter expert" 
  },
  dumbledore: { 
    name: "Dumbledore", 
    icon: "🧙‍♂️", 
    description: "Wise headmaster of Hogwarts" 
  },
  dobby: { 
    name: "Dobby", 
    icon: "🧦", 
    description: "Loyal house-elf" 
  },
  snape: { 
    name: "Snape", 
    icon: "⚗️", 
    description: "Potions master and professor" 
  }
};

export function BookAIAssistant({ bookContent, bookTitle }: BookAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [copiedToInput, setCopiedToInput] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('standard');
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your Harry Potter assistant. I have knowledge about all four books. Select some text and ask me a question about it.` 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listen for text selection events
    const handleSelectionChange = () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      
      // Small delay to ensure the selection has stabilized
      selectionTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          setSelectedText(selection.toString().trim());
          // Reset copy indicator when new text is selected
          setCopiedToInput(false);
        }
      }, 100);
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedText('');
    setUserQuery('');
    setShowCharacterSelect(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserQuery(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleCharacterChange = (character: CharacterType) => {
    // If changing to a different character, add a notification message
    if (character !== selectedCharacter && messages.length > 0) {
      const characterInfo = characters[character];
      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: `Now talking with ${characterInfo.icon} ${characterInfo.name}`
        }
      ]);
    }
    
    setSelectedCharacter(character);
    setShowCharacterSelect(false);
  };

  const useSelectedTextAsContext = () => {
    if (selectedText) {
      const newQuery = `About this text: "${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"`;
      setUserQuery(newQuery);
      setCopiedToInput(true);
      
      // Focus the textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  const clearSelectedText = () => {
    setSelectedText('');
    setCopiedToInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuery.trim()) return;
    
    // Add user message
    const userMessage: Message = { role: 'user', content: userQuery };
    setMessages(prev => [...prev, userMessage]);
    setUserQuery('');
    setIsLoading(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Build context with selected text
      let queryWithContext = userQuery;
      
      // If text is selected, add it as context to the query
      if (selectedText) {
        queryWithContext = `SELECTED TEXT FROM "${bookTitle}": "${selectedText}"\n\nQUESTION: ${userQuery}`;
        // Add the selected text as a system message to keep the conversation context clear
        setMessages(prev => [
          ...prev,
          { 
            role: 'system', 
            content: `Reference: "${selectedText.substring(0, 200)}${selectedText.length > 200 ? '...' : ''}"` 
          }
        ]);
      }
      
      // Convert messages to the format expected by getGroqResponse
      // Only include actual conversation messages (not system notifications)
      const conversationHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Call the Groq API through our service with the selected character
      const aiResponse = await getGroqResponse(
        queryWithContext,
        conversationHistory as Array<{role: 'user' | 'assistant' | 'system', content: string}>,
        selectedCharacter
      );
      
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: aiResponse }
      ]);
      
      // Clear selected text after response
      setSelectedText('');
      setCopiedToInput(false);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'Sorry, I encountered an error processing your question. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCharacterSelect = () => {
    setShowCharacterSelect(!showCharacterSelect);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        aria-label="Open AI Assistant"
      >
        <BookOpen size={24} />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 transition-all duration-300 ${
        isMinimized ? 'w-64 h-12' : 'w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)]'
      }`}
    >
      {/* Header */}
      <div className="bg-[#8A2BE2] text-white p-3 flex justify-between items-center">
        <button 
          onClick={toggleCharacterSelect}
          className="font-medium text-sm flex items-center hover:bg-white/10 px-2 py-1 rounded transition-colors"
        >
          <span className="mr-2" role="img" aria-label={characters[selectedCharacter].name}>
            {characters[selectedCharacter].icon}
          </span>
          <span>{characters[selectedCharacter].name}</span>
        </button>

        <div className="flex space-x-1">
          <button 
            onClick={toggleMinimize} 
            className="p-1 hover:bg-white/20 rounded"
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize size={14} /> : <Minimize size={14} />}
          </button>
          <button 
            onClick={handleClose} 
            className="p-1 hover:bg-white/20 rounded"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Character selection dropdown */}
          {showCharacterSelect && (
            <div className="absolute top-12 left-0 w-48 bg-white border border-gray-200 rounded-br-md shadow-lg z-10">
              {Object.entries(characters).map(([key, character]) => (
                <button
                  key={key}
                  className={`flex items-center w-full px-4 py-2 text-left hover:bg-purple-50 ${
                    selectedCharacter === key ? 'bg-purple-100' : ''
                  }`}
                  onClick={() => handleCharacterChange(key as CharacterType)}
                >
                  <span className="mr-2 text-lg" role="img" aria-label={character.name}>
                    {character.icon}
                  </span>
                  <div>
                    <div className="font-medium">{character.name}</div>
                    <div className="text-xs text-gray-500">{character.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Text Display - Always visible panel at top when text is selected */}
          {selectedText && (
            <div className="bg-[#FFF8E1] border-b border-[#FFE082] p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-[#8B4513]">Selected Text</h4>
                <div className="flex space-x-1">
                  <button
                    onClick={useSelectedTextAsContext}
                    className={`p-1.5 rounded ${copiedToInput ? 'bg-green-100 text-green-600' : 'bg-[#FFE082] hover:bg-[#FFD54F] text-[#8B4513]'}`}
                    title="Use as context"
                  >
                    {copiedToInput ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={clearSelectedText}
                    className="p-1.5 rounded bg-[#FFE082] hover:bg-[#FFD54F] text-[#8B4513]"
                    title="Clear selection"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm italic text-[#8B4513] max-h-24 overflow-y-auto whitespace-pre-line">
                {selectedText.length > 300 
                  ? `${selectedText.substring(0, 300)}...` 
                  : selectedText}
              </p>
            </div>
          )}

          {/* Messages Container */}
          <div className={`overflow-y-auto bg-white ${selectedText ? 'h-[calc(100%-11rem)]' : 'h-[calc(100%-7rem)]'}`}>
            {messages.map((message, index) => {
              if (message.role === 'system') {
                return (
                  <div key={index} className="text-center text-xs text-gray-500 my-2 px-4 py-1">
                    {message.content}
                  </div>
                );
              }
              
              return (
                <div 
                  key={index} 
                  className={`px-4 py-3 ${
                    message.role === 'user' 
                      ? 'border-l-4 border-[#8A2BE2] bg-gray-50'
                      : ''
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    {message.role === 'user' ? 'You' : characters[selectedCharacter].name}
                  </p>
                  <p className={`text-sm whitespace-pre-line ${message.role === 'assistant' ? 'text-[#FFD700]' : ''}`}>
                    {message.content}
                  </p>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="dot-flashing"></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-end">
              <textarea
                ref={textareaRef}
                className="flex-1 border border-gray-300 rounded-lg resize-none p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] min-h-[2.5rem] max-h-[150px]"
                placeholder={`Ask ${characters[selectedCharacter].name} about the selected text...`}
                value={userQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
                rows={1}
              />
              <button 
                type="submit" 
                className="ml-2 bg-[#8A2BE2] text-white p-2 rounded-lg hover:bg-[#7722CC] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!userQuery.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
} 