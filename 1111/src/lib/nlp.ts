/**
 * This file previously contained NLP processing logic.
 * Now we delegate to the Groq API service for all language processing.
 */

import { tokenize } from './tokenizer';

interface BookContext {
  book: string;
  chapter: string;
  content: string;
  relevance: number;
}

interface Entity {
  name: string;
  type: 'character' | 'location' | 'spell' | 'creature' | 'object';
  mentions: string[];
  relationships: Map<string, string>;
}

class NLPProcessor {
  private entities: Map<string, Entity> = new Map();
  private contextHistory: BookContext[] = [];

  // Advanced tokenization with entity recognition
  processText(text: string): string[] {
    const tokens = tokenize(text);
    return this.enhanceTokens(tokens);
  }

  private enhanceTokens(tokens: string[]): string[] {
    return tokens.map(token => {
      // Convert common variations to canonical forms
      if (token.toLowerCase() === 'voldemort' || token.toLowerCase() === 'you-know-who') {
        return 'Lord_Voldemort';
      }
      return token;
    });
  }

  // Context tracking
  addContext(context: BookContext) {
    this.contextHistory.push(context);
    if (this.contextHistory.length > 5) {
      this.contextHistory.shift();
    }
  }

  // Entity management
  addEntity(name: string, type: Entity['type']) {
    if (!this.entities.has(name)) {
      this.entities.set(name, {
        name,
        type,
        mentions: [],
        relationships: new Map()
      });
    }
  }

  addRelationship(entity1: string, entity2: string, relationship: string) {
    const e1 = this.entities.get(entity1);
    if (e1) {
      e1.relationships.set(entity2, relationship);
    }
  }

  // Relevance scoring
  calculateRelevance(query: string, context: string): number {
    const queryTokens = this.processText(query);
    const contextTokens = this.processText(context);
    
    let score = 0;
    let matches = 0;
    
    // Calculate token matches with positional weighting
    for (const qt of queryTokens) {
      const idx = contextTokens.indexOf(qt);
      if (idx !== -1) {
        matches++;
        // Matches closer to the beginning get higher weight
        const positionFactor = 1 - (idx / (contextTokens.length * 2));
        score += 1 + positionFactor;
      }
    }
    
    // Boost score based on percentage of matching tokens
    const matchPercentage = matches / queryTokens.length;
    score *= (1 + matchPercentage);
    
    // Normalize score
    if (queryTokens.length === 0) return 0;
    return score / (queryTokens.length * 2); // Max possible score is 2 per token
  }

  // Get most relevant context
  getMostRelevantContext(query: string): BookContext | null {
    if (this.contextHistory.length === 0) return null;

    let bestContext = this.contextHistory[0];
    let bestScore = this.calculateRelevance(query, bestContext.content);

    for (const context of this.contextHistory.slice(1)) {
      const score = this.calculateRelevance(query, context.content);
      if (score > bestScore) {
        bestScore = score;
        bestContext = context;
      }
    }

    return bestContext;
  }
}

export const nlpProcessor = new NLPProcessor();