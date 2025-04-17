import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles.css'
import './index.css'

// Import the bookProcessor to ensure it's initialized on application startup
import { bookProcessor } from './lib/bookProcessor'

// Ensure books are initialized as early as possible
try {
  // The bookProcessor constructor automatically starts loading books
  // This is just to make the initialization explicit
  console.log('Starting Harry Potter Storybook application...')
} catch (error) {
  console.error('Error initializing application:', error)
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
