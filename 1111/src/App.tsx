import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { NotFound } from './pages/NotFound';
import { BooksPage } from './pages/BooksPage';
import { Evaluation } from './pages/Evaluation';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Simulate initialization
    const initTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(initTimer);
  }, []);
  
  // Handle app-level errors
  if (hasError) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Magical Mishap!</h2>
          <p className="error-message">
            Something went wrong while summoning the magic. Perhaps a mischievous Niffler got into our code?
          </p>
          <button 
            className="error-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-wand">
          <div className="loading-spark"></div>
        </div>
        <p className="loading-text">Summoning magical knowledge...</p>
      </div>
    );
  }
  
  // Navigation header
  const NavHeader = () => {
    // Determine active page
    const isChat = location.pathname === '/';
    const isBooks = location.pathname.includes('/books');
    const isEvaluation = location.pathname === '/evaluation';
    
    return (
      <header className="nav-header">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-violet-600 text-transparent bg-clip-text">
            Story Book AI
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link 
                  to="/" 
                  className={`nav-link ${isChat ? 'active-link' : ''}`}
                  style={{ 
                    color: isChat ? '#f5c542' : undefined,
                    borderBottom: isChat ? '2px solid #f5c542' : undefined
                  }}
                >
                  Chat
                </Link>
              </li>
              <li>
                <Link 
                  to="/books" 
                  className={`nav-link ${isBooks ? 'active-link' : ''}`}
                  style={{ 
                    color: isBooks ? '#f5c542' : undefined,
                    borderBottom: isBooks ? '2px solid #f5c542' : undefined
                  }}
                >
                  Books
                </Link>
              </li>
              <li>
                <Link 
                  to="/evaluation" 
                  className={`nav-link ${isEvaluation ? 'active-link' : ''}`}
                  style={{ 
                    color: isEvaluation ? '#f5c542' : undefined,
                    borderBottom: isEvaluation ? '2px solid #f5c542' : undefined
                  }}
                >
                  Evaluation
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    );
  };
  
  // Main app with routes
  return (
    <div className="min-h-screen w-full flex flex-col">
      <NavHeader />
      <main className="flex-grow overflow-y-auto">
        <Routes>
          <Route path="/" element={<ChatInterface />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
