const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Get list of available books
router.get('/', (req, res) => {
  try {
    const booksDir = path.resolve(__dirname, '../books');
    const files = fs.readdirSync(booksDir);
    
    const books = files.map(file => ({
      filename: file,
      title: file.replace('.txt', ''),
      path: `/api/books/${encodeURIComponent(file)}`
    }));
    
    res.json({ success: true, books });
  } catch (error) {
    console.error('Error listing books:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list books',
      details: error.message
    });
  }
});

// Get a specific book's content
router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const booksDir = path.resolve(__dirname, '../books');
    const filePath = path.join(booksDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found',
        details: `File ${filename} does not exist`
      });
    }
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Serve the file content
    res.type('text/plain').send(content);
  } catch (error) {
    console.error('Error serving book:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to read book',
      details: error.message
    });
  }
});

module.exports = router; 