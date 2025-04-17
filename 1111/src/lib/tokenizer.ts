/**
 * Simple tokenizer function to split text into tokens
 * This is a very basic implementation - in production you'd use a proper tokenizer
 */
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
} 