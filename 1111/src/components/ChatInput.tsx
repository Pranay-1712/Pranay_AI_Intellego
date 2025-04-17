
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  className?: string;
}

export function ChatInput({ onSendMessage, isLoading, className }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <Input
        placeholder="Ask about the first 4 Harry Potter books..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="magical-input"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={isLoading || !message.trim()}
        className="bg-hogwarts-gold hover:bg-hogwarts-gold/80 text-hogwarts-black"
      >
        {isLoading ? (
          <Sparkles className="h-4 w-4 animate-quill-writing" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
