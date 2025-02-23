import { useSignal, useSignalEffect } from "@preact/signals";
import { useRef } from "preact/hooks";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function FloatingChat() {
  const isOpen = useSignal(false);
  const messages = useSignal<Message[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const isProcessing = useSignal(false);

  const handleOpenChat = () => {
    isOpen.value = true;
  };

  const handleCloseChat = () => {
    isOpen.value = false;
  };

  useSignalEffect(() => {
    // Dispatch custom event when chat state changes
    window.dispatchEvent(new CustomEvent('chatStateChange', {
      detail: { isOpen: isOpen.value }
    }));
  });

  const handleSubmit = async () => {
    if (!inputRef.current?.value.trim() || isProcessing.value) return;
    
    const userMessage = inputRef.current.value.trim();
    inputRef.current.value = '';
    
    messages.value = [...messages.value, { role: "user", content: userMessage }];
    isProcessing.value = true;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      messages.value = [...messages.value, { role: "assistant", content: data.response }];

      // Dispatch event with the response
      window.dispatchEvent(new CustomEvent('chatResponse', {
        detail: { message: userMessage, response: data.response }
      }));
    } catch (error) {
      console.error("Chat error:", error);
      messages.value = [...messages.value, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }];
    } finally {
      isProcessing.value = false;
    }
  };

  const messageKey = (message: Message, index: number) => 
    `${index}-${message.content.substring(0, 10)}`;

  return (
    <div class="fixed bottom-4 right-4 z-50">
      {isOpen.value ? (
        <div 
          ref={chatRef}
          class="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex justify-between items-center">
            <h3 class="text-white font-semibold">Chat Assistant</h3>
            <button
              type="button"
              onClick={handleCloseChat}
              class="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <title>Close chat window</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.value.map((message, index) => (
              <div
                key={messageKey(message, index)}
                class={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  class={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isProcessing.value && (
              <div class="flex justify-start">
                <div class="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div class="border-t p-4">
            <div class="flex space-x-2">
              <textarea
                ref={inputRef}
                class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing.value}
                class={`px-4 py-2 rounded-lg ${
                  isProcessing.value
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } transition-colors`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenChat}
          class="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>Open chat window</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
