# Harry Potter AI Conversational Assistant

## Overview

The Harry Potter AI is an interactive conversational assistant that allows users to discuss the Harry Potter series with an AI that has comprehensive knowledge of the books. The application features a chat interface, book browsing capability, and an evaluation dashboard to measure the AI's performance.

## Features

### 1. Chat Interface
- **Contextual Conversation**: Have natural conversations about Harry Potter with the AI
- **Character Modes**: Interact with the AI as different characters (Standard, Dumbledore, Snape, or Dobby)
- **Conversation History**: Maintains context throughout the conversation
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 2. Book Browser
- **Access to Books**: Browse through the Harry Potter books included in the application
- **Text Selection**: Select text to ask specific questions about passages
- **Search Functionality**: Find specific content within the books

### 3. Evaluation Dashboard
- **NLP Performance Metrics**: Measure the AI's language understanding capabilities
  - BLEU Score: Text generation quality comparison
  - Response Accuracy: Factual correctness of responses
  - Contextual Coherence: Ability to maintain conversation context
  - Relevance: How well responses address questions
- **Technical Metrics**: System performance measurements
- **Efficiency Metrics**: Response time and resource usage
- **Feature Tests**: Verification of key functionality

## Technical Architecture

### Frontend
- Built with React and TypeScript
- UI components from Tailwind CSS and custom components
- Responsive design using Flexbox and CSS Grid

### Backend Integration
- Connects to the Groq API for LLM capabilities
- Uses Llama 3 (8B) model for generating responses
- Local book storage and processing

### Key Components
- `ChatInterface.tsx`: Main chat UI and conversation handling
- `BooksPage.tsx`: Book browser and content selection
- `Evaluation.tsx`: Dashboard for assessing AI performance
- `groqService.ts`: API integration for LLM capabilities
- `bookProcessor.ts`: Handles loading and processing book content

## AI Capabilities

### Knowledge Base
- Contains content from the Harry Potter books
- Provides accurate information based on book content
- Refuses to answer questions outside of its knowledge scope

### Character Emulation
- **Standard Mode**: Neutral, informative responses
- **Dumbledore Mode**: Wise, philosophical responses
- **Snape Mode**: Stern, direct, slightly sarcastic responses
- **Dobby Mode**: Third-person, eager-to-help responses

### Conversation Abilities
- Maintains context across multiple turns
- References previous exchanges
- Provides detailed explanations
- Stays on topic and relevant to Harry Potter

## Evaluation Methodology

The application includes a sophisticated evaluation system that measures the AI's performance across multiple dimensions:

### NLP Performance
- **BLEU Score**: Compares generated text against reference answers using n-gram matching and weighted scoring
- **Response Accuracy**: Assesses factual correctness using entity recognition and knowledge factor analysis
- **Contextual Coherence**: Measures ability to maintain context using multi-turn conversation tests
- **Relevance**: Evaluates how well responses address questions using topic analysis and quality metrics

### Technical Performance
- Model size and parameters
- Code quality assessment
- API integration status
- Test coverage metrics

### Efficiency Metrics
- Response time measurements
- Memory usage analysis
- Request throughput tracking
- API success rate monitoring

## Privacy and Data Handling

- No personal data stored
- Conversation data is not retained between sessions
- No user accounts or login required
- All processing happens client-side except for LLM API calls

## Setup and Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- A Groq API key (for LLM functionality)

### Environment Setup
1. Clone the repository
   ```
   git clone https://github.com/yourusername/harry-potter-ai.git
   cd harry-potter-ai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Groq API key:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

3. To build for production:
   ```
   npm run build
   ```

4. To serve the production build:
   ```
   npm run serve
   ```

## Troubleshooting

- **API Connection Issues**: Ensure your Groq API key is correctly set in the `.env` file
- **Book Loading Problems**: Check the console for error messages related to book loading
- **Performance Issues**: Try reducing the conversation history if responses become slow

## Future Enhancements

- Additional character modes (Hagrid, McGonagall, etc.)
- Voice interface for spoken conversations
- Image generation for scene descriptions
- Expanded book collection with more detailed annotations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- J.K. Rowling for the Harry Potter series
- Groq for the LLM API
- The React and TypeScript communities for their excellent tools

## How to Run Our Code

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/harry-potter-ai.git
   cd harry-potter-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
   You can obtain a Groq API key by signing up at [groq.com](https://groq.com).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

The application will load with three main sections accessible from the navigation bar:
- **Chat**: Interact with the Harry Potter AI
- **Books**: Browse through the Harry Potter books
- **Evaluation**: View performance metrics for the AI

For the best experience, start by asking questions about Harry Potter in the Chat section. You can also try different character modes by selecting from the dropdown in the chat interface. 