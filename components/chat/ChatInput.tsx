import { useSignal } from "@preact/signals";
import { isApiConfigured, lang, query, settings, addMessage } from "../chat/store.ts";
import { startStream } from "../chat/stream.ts";
import { chatIslandContent } from "../../internalization/content.ts";
import ImageUploadButton from "../ImageUploadButton.tsx";
import VoiceRecordButton from "../VoiceRecordButton.tsx";
import { resetTranscript } from "./speech.ts";
import { ChatSubmitButton } from "../ChatSubmitButton.tsx";

function TypingIndicator() {
    return (
        <div className="flex items-center space-x-2 px-4 py-2">
            <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-[bounce_1.4s_infinite_.2s]" />
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-[bounce_1.4s_infinite_.4s]" />
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-[bounce_1.4s_infinite_.6s]" />
            </div>
            <span className="text-sm text-gray-500">AI is thinking...</span>
        </div>
    );
}

function ChatInput() {
    const files = useSignal<(Image | File)[]>([]);
    const isThinking = useSignal(false);

    const deleteImage = (event: MouseEvent) => {
        const target = event.target as HTMLImageElement;
        const index = files.value.findIndex((image) => image.image_url.url === target.src);
        files.value.splice(index, 1);
    };

    const handleImagesUploaded = (newFiles: Image[]) => {
        files.value = [...files.value, ...newFiles];
    };

    const handleStartStream = async (text = "", transcription?: string) => {
        isThinking.value = true;
        try {
            await startStream(text, transcription, files.value);
        } catch (error: unknown) {
            // Format error message
            let errorMessage = "An unknown error occurred while processing your request.";
            
            if (error instanceof Error) {
                // Extract meaningful message from HTML response if present
                const htmlMatch = error.message.match(/<title>(.*?)<\/title>/);
                if (htmlMatch) {
                    errorMessage = htmlMatch[1];
                } else {
                    // Clean up the backend error message
                    const cleanMessage = error.message
                        .replace(/\*\*BACKEND ERROR\*\*\n?/g, '')
                        .replace(/Statuscode: \d+\n?/g, '')
                        .replace(/Message: /g, '')
                        .trim();
                    errorMessage = cleanMessage || error.message;
                }
            }

            // Add error message to chat
            addMessage({
                role: "assistant",
                content: `❌ **Error**: ${errorMessage}`
            });
        } finally {
            isThinking.value = false;
        }
    };

    return (
        <>
            <div class={"max-w-xl w-full mx-auto relative"}>
                {files.value.length > 0 && (
                    <div class="w-full flex justify-center shadow">
                        <div class="p-2 flex flex-wrap max-w-xs gap-8">
                            {files.value.filter((item) => 'image_url' in item).map((image, index) => (
                                <img
                                    key={index}
                                    src={image.image_url.url}
                                    onClick={deleteImage}
                                    alt={`Thumbnail ${index + 1}`}
                                    class="w-32 h-32 object-cover rounded-lg shadow-xl bg-white/50 cursor-pointer hover:bg-red-500/50"
                                />
                            ))}
                            {files.value.filter((item) => 'pdf_url' in item).map((image, index) => (
                                <div
                                    key={index}
                                    onClick={deleteImage}
                                    class="w-32 h-32 object-cover rounded-lg shadow-xl bg-white/50 cursor-pointer hover:bg-red-500/50 grid place-content-center text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="32" height="32" stroke-width="2"> <path d="M14 3v4a1 1 0 0 0 1 1h4"></path> <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4"></path> <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6"></path> <path d="M17 18h2"></path> <path d="M20 15h-3v6"></path> <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z"></path> </svg>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {isThinking.value && <TypingIndicator />}
                <div className="shadow-lg flex cursor-text flex-col rounded-3xl border border-token-border-light px-3 py-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors contain-inline-size bg-main-surface-primary bg-white mx-4 mb-4">
                    <textarea
                        disabled={!isApiConfigured.value || isThinking.value}
                        type="text"
                        value={query}
                        placeholder={chatIslandContent[lang.value]["placeholderText"]}
                        onInput={(e) => {
                            const textarea = e.currentTarget;
                            query.value = textarea.value; // Update query and possibly the messages array
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault(); // Prevents adding a new line in the textarea
                                handleStartStream();
                            }
                        }}
                        class="block h-10 w-full resize-none border-0 bg-transparent px-0 py-2 text-token-text-primary placeholder:text-token-text-secondary focus-visible:outline-none"
                    />

                    <div class={"flex justify-between w-full"}>
                        <span>
                            <ImageUploadButton
                                onImagesUploaded={handleImagesUploaded}
                            />

                            <VoiceRecordButton
                                resetTranscript={resetTranscript.value}
                                sttUrl={settings.value.sttUrl}
                                sttKey={settings.value.sttKey}
                                sttModel={settings.value.sttModel}
                                onFinishRecording={(finalTranscript) => {
                                    handleStartStream("", finalTranscript);
                                }}
                                onInterimTranscript={(interimTranscript) => {
                                    query.value = (query.value + " " + interimTranscript);
                                }}
                            />
                        </span>

                        <ChatSubmitButton
                            onMouseDown={() => handleStartStream()}
                            disabled={!query.value || !isApiConfigured.value || isThinking.value}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatInput