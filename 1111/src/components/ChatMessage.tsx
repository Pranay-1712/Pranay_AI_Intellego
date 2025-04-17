
import { cn } from "@/lib/utils";
import React from "react";

export type MessageType = "user" | "assistant";

interface ChatMessageProps {
  type: MessageType;
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ type, content, isLoading }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg max-w-[85%] mb-4",
        type === "user"
          ? "bg-hogwarts-blue/10 ml-auto text-hogwarts-blue border border-hogwarts-blue/20"
          : "bg-hogwarts-red/10 mr-auto text-hogwarts-red border border-hogwarts-red/20"
      )}
    >
      <div className="text-xs mb-1 font-semibold">
        {type === "user" ? "You" : "Magical Scribe"}
      </div>
      {isLoading ? (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-hogwarts-gold rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-hogwarts-gold rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-hogwarts-gold rounded-full animate-pulse delay-300"></div>
        </div>
      ) : (
        <div className="whitespace-pre-wrap">{content}</div>
      )}
    </div>
  );
}
