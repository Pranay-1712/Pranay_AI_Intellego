const express = require('express');
const cors = require('cors');
const path = require('path');
const booksRouter = require('./books');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Books API route
app.use('/api/books', booksRouter);

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is working!' });
});

// Direct book file access
app.use('/books', express.static(path.join(__dirname, '../books')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Book API available at http://localhost:${PORT}/api/books`);
  console.log(`Direct book access at http://localhost:${PORT}/books`);
}); 