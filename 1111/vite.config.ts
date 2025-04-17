import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { IncomingMessage, ServerResponse } from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add middleware to handle book file requests
    middlewares: [
      (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // Handle requests for book files
        if (req.url?.startsWith('/books/')) {
          const bookPath = req.url.replace('/books/', '');
          const filePath = path.resolve(__dirname, 'public/books', bookPath);
          
          // Check if file exists
          if (fs.existsSync(filePath)) {
            console.log(`Serving book file: ${filePath}`);
            
            // Set appropriate headers
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            
            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            
            // Log success
            console.log(`Successfully served book file: ${bookPath}`);
            return;
          } else {
            console.warn(`Book file not found: ${filePath}`);
          }
        }
        
        // Not a book request, or book not found, continue to next middleware
        next();
      }
    ],
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: 'public',
  // Copy books directory to public during build
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
}));
