import { useState } from "preact/hooks";
import FloatingChat from "../components/chat/FloatingChat.tsx";

export default function PresentationGeneratorIsland() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div class="flex h-full gap-4 p-4">
      <div class="flex-1 bg-white rounded-lg shadow-lg p-6">
        <div class="h-full flex flex-col">
          <h2 class="text-2xl font-bold mb-4">PowerPoint Presentation</h2>
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              class="flex-1 w-full border-0 rounded"
              title="PowerPoint Preview"
            />
          ) : (
            <div class="flex-1 flex items-center justify-center text-gray-500">
              Your presentation will appear here
            </div>
          )}
          <div class="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                // TODO: Implement presentation generation
              }}
              class="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Generate Presentation
            </button>
          </div>
        </div>
      </div>
      
      <FloatingChat />
    </div>
  );
}
