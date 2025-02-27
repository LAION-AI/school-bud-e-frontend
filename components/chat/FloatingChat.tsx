import { MessageCircle } from "lucide-preact";
import { useSignal, useSignalEffect } from "@preact/signals";
import { useRef, useEffect } from "preact/hooks";
import ChatHistory from "./ChatHistory.tsx";
import { messages as storeMessages, addMessage } from "./store.ts";
import { startStream } from "./stream.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";

export default function FloatingChat() {
  const isOpen = useSignal(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const isProcessing = useSignal(false);
  
  // Check if we're on a chat page (done once during component initialization)
  const isOnChatPage = IS_BROWSER ? window.location.pathname.startsWith('/chat') : false;

  // Add event listener for the Escape key to close the chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen.value) {
        isOpen.value = false;
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Don't render anything if we're on a chat page
  if (isOnChatPage) {
    return null;
  }

  const handleOpenChat = () => {
    isOpen.value = true;
  };

  const handleCloseChat = () => {
    isOpen.value = false;
  };

  useSignalEffect(() => {
    // Dispatch custom event when chat state changes
    window.dispatchEvent(
      new CustomEvent("chatStateChange", {
        detail: { isOpen: isOpen.value },
      })
    );
  });

  const handleSubmit = async () => {
    if (!inputRef.current?.value.trim() || isProcessing.value) return;

    const userMessage = inputRef.current.value.trim();
    inputRef.current.value = "";

    // Update global chat via store
    addMessage({ role: "user", content: userMessage });
    isProcessing.value = true;

    try {
      // Use the shared sendChatMessage function
      await startStream(userMessage, undefined, []);
      // Optionally, if needed, you can dispatch a chatResponse event after sending the message.
      window.dispatchEvent(
        new CustomEvent("chatResponse", {
          detail: { message: userMessage },
        })
      );
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      });
    } finally {
      isProcessing.value = false;
      // Focus the input field again after sending the message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div class="fixed bottom-4 right-4 z-50">
      {isOpen.value ? (
        <div
          ref={chatRef}
          class="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col overflow-hidden border border-gray-300"
        >
          {/* Header with improved design */}
          <div class="p-3 bg-white border-b border-gray-200 flex justify-between items-center">
            <h3 class="font-medium text-gray-800 flex items-center gap-2">
              <MessageCircle size={18} className="text-blue-500" />
              Chat Assistant
            </h3>
            <button
              type="button"
              onClick={handleCloseChat}
              class="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <title>Close chat</title>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat history area */}
          <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
            <ChatHistory messages={storeMessages.value} />
          </div>

          {/* Input area with improved design */}
          <div class="p-3 bg-white border-t border-gray-200">
            <div class="flex rounded-lg border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
              <textarea
                ref={inputRef}
                placeholder="Type your message..."
                class="flex-1 p-2 resize-none min-h-[40px] max-h-24 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isProcessing.value}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing.value}
                class={`px-3 flex items-center justify-center ${
                  isProcessing.value
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <title>Send message</title>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenChat}
          class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
