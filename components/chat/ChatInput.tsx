import { useSignal } from "@preact/signals";
import { isApiConfigured, lang, query, settings } from "../chat/store.ts";
import { startStream } from "../chat/stream.ts";
import { chatIslandContent } from "../../internalization/content.ts";
import ImageUploadButton from "../ImageUploadButton.tsx";
import VoiceRecordButton from "../VoiceRecordButton.tsx";
import { resetTranscript } from "./speech.ts";
import { ChatSubmitButton } from "../ChatSubmitButton.tsx";

function ChatInput() {
    const images = useSignal<Image[]>([]);

    const deleteImage = (event: MouseEvent) => {
        const target = event.target as HTMLImageElement;
        const index = images.value.findIndex((image) => image.image_url.url === target.src);
        images.value.splice(index, 1);
    };

    const handleImagesUploaded = (newImages: Image[]) => {
        images.value = [...images.value, ...newImages];
    };


    return (
        <>
            {images.value.length > 0 && (
                <div class="w-full flex justify-center">
                    <div class="p-2 flex flex-wrap max-w-xs gap-8">
                        {images.value.map((image, index) => (
                            <img
                                key={index}
                                src={image.image_url.url}
                                onClick={deleteImage}
                                alt={`Thumbnail ${index + 1}`}
                                class="w-32 h-32 object-cover rounded-lg shadow-xl bg-white/50 cursor-pointer hover:bg-red-500/50"
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className="flex cursor-text flex-col rounded-3xl border border-token-border-light px-3 py-1 shadow-[0_9px_9px_0px_rgba(0,0,0,0.01),_0_2px_5px_0px_rgba(0,0,0,0.06)] transition-colors contain-inline-size dark:border-none dark:shadow-none bg-main-surface-primary bg-white mx-4 mb-4">
                <textarea
                    disabled={!isApiConfigured.value}
                    type="text"
                    value={query}
                    placeholder={chatIslandContent[lang.value]["placeholderText"]}
                    onInput={(e) => {
                        const textarea = e.currentTarget;
                        textarea.style.height = "auto"; // Reset height to auto to get the correct new height
                        textarea.style.height = textarea.scrollHeight + "px"; // Set new height
                        query.value = textarea.value; // Update query and possibly the messages array
                    }}
                    onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // Prevents adding a new line in the textarea
                            startStream("", undefined, images.value);
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
                                startStream(finalTranscript);
                            }}
                            onInterimTranscript={(interimTranscript) => {
                                query.value = (query.value + " " + interimTranscript);
                            }}
                        />
                    </span>

                    <ChatSubmitButton
                        onMouseDown={() => startStream("", undefined, images.value)}
                        disabled={!query.value || !isApiConfigured}
                    />
                </div>
            </div>
        </>
    )
}

export default ChatInput