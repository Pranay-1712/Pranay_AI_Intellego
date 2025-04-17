/**
 * Script to copy book files from books/ directory to public/books/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const booksDir = path.join(rootDir, 'books');
const publicBooksDir = path.join(rootDir, 'public', 'books');

// Create public/books directory if it doesn't exist
console.log('Ensuring public/books directory exists...');
if (!fs.existsSync(publicBooksDir)) {
  fs.mkdirSync(publicBooksDir, { recursive: true });
  console.log('Created public/books directory');
}

// Check if books directory exists
if (!fs.existsSync(booksDir)) {
  console.error('❌ Error: books directory does not exist at:', booksDir);
  process.exit(1);
}

// Get list of book files
const bookFiles = fs.readdirSync(booksDir).filter(file => file.endsWith('.txt'));

if (bookFiles.length === 0) {
  console.error('❌ Error: No .txt files found in books directory');
  process.exit(1);
}

// Copy each book file to public/books directory
console.log('Copying book files to public/books directory...');
let successCount = 0;

for (const file of bookFiles) {
  const sourcePath = path.join(booksDir, file);
  const destPath = path.join(publicBooksDir, file);
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${file}`);
    successCount++;
  } catch (error) {
    console.error(`❌ Error copying ${file}:`, error.message);
  }
}

console.log(`Copied ${successCount} of ${bookFiles.length} book files`);

// Verify book files in public directory
const publicBookFiles = fs.readdirSync(publicBooksDir).filter(file => file.endsWith('.txt'));
console.log(`Books available in public/books: ${publicBookFiles.length}`);

publicBookFiles.forEach(file => {
  const filePath = path.join(publicBooksDir, file);
  const stats = fs.statSync(filePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`  - ${file} (${fileSizeMB} MB)`);
});

console.log('Book copying completed successfully!'); 