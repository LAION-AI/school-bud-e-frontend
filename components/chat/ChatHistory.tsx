import { useEffect, useRef } from "preact/hooks";

export interface Message {
  role: "user" | "assistant";
  content: string | string[];  // allow string or array of string
}

interface ChatHistoryProps {
  messages: Message[];
  isProcessing?: boolean;
}

// Helper function to get message content as string
const getMessageContent = (message: Message): string => {
  if (typeof message.content === 'string') return message.content;
  if (Array.isArray(message.content)) return message.content.join('');
  return "";
};

export default function ChatHistory({ messages, isProcessing = false }: ChatHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute a hash based on message contents to trigger auto-scroll when messages update
  const messagesHash = messages.map(msg => getMessageContent(msg)).join('');
  useEffect(() => {
    // Auto-scroll to bottom when messages update
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messagesHash]);

  const messageKey = (message: Message, index: number) => `${index}-${getMessageContent(message).substring(0, 10)}`;

  return (
    <div ref={containerRef} class="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={messageKey(message, index)} class={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div class={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
            {getMessageContent(message)}
          </div>
        </div>
      ))}
      {isProcessing && (
        <div class="flex justify-start">
          <div class="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
            Thinking...
          </div>
        </div>
      )}
    </div>
  );
} 