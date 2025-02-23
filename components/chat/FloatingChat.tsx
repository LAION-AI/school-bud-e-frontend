import { MessageCircle, Send } from "lucide-preact";
import { useSignal, useSignalEffect } from "@preact/signals";
import { useRef } from "preact/hooks";
import { ChatSubmitButton } from "../ChatSubmitButton.tsx";
import ChatHistory from "./ChatHistory.tsx";
import { messages as storeMessages, addMessage } from "./store.ts";
import { sendChatMessage } from "./chatActions.ts";

export default function FloatingChat() {
  const isOpen = useSignal(false);
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
      await sendChatMessage(userMessage);
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
    }
  };

  return (
    <div class="fixed bottom-4 right-4 z-50">
      {isOpen.value ? (
        <div
          ref={chatRef}
          class="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col overflow-hidden"
        >
          {/* Header with improved design */}
          <div class="bg-gradient-to-r from-orange-500 to-red-600 p-4 flex justify-between items-center">
            <div class="flex items-center gap-2">
              {/* @ts-ignore */}
              <MessageCircle class="w-6 h-6 text-white" />
              <h3 class="text-white font-semibold">Dein Chat Assistant</h3>
            </div>
            <button
              type="button"
              onClick={handleCloseChat}
              class="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Close chat window</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat History Component */}
          <ChatHistory
            messages={storeMessages.value as { role: "user" | "assistant", content: string }[]}
            isProcessing={isProcessing.value}
          />

          {/* Input Area */}
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
              <ChatSubmitButton
                onClick={handleSubmit}
                disabled={isProcessing.value}
              />
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Open chat window</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
