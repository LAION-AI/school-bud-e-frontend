import { useEffect, useState } from "preact/hooks";
import { chatIslandContent, headerContent } from "../internalization/content.ts";
import type { JSX } from 'preact';
import { ChatSubmitButton } from "./ChatSubmitButton.tsx";
import VoiceRecordButton from "./VoiceRecordButton.tsx";
import ImageUploadButton from "./ImageUploadButton.tsx";
import RightSidebar from "../islands/RightSidebar.tsx";
import { Message } from "./Message.tsx";
import LogoHeader from "./chat/LogoHeader.tsx";

interface AudioItem {
  audio: HTMLAudioElement;
  played: boolean;
}

type AudioFileDict = Record<number, Record<number, AudioItem>>;

interface ChatTemplateProps {
  settings: any;
  lang: string;
  parentImages: Image[];
  messages: Message[];
  isComplete: boolean;
  currentEditIndex: number;
  audioFileDict: AudioFileDict;
  onSpeakAtGroupIndexAction: (groupIndex: number) => void;
  onRefreshAction: (groupIndex: number) => void;
  onEditAction: (groupIndex: number) => void;
  onUploadActionToMessages: (uploadedMessages: Message[]) => void;
  onImageChange: (images: Image[]) => void;
  onTrashAction: () => void;
  startStream: (transcript: string) => void;
  query: string;
  setQuery: (value: string) => void;
  handleImagesUploaded: (images: Image[]) => void;
  children: JSX.Element | JSX.Element[];
  resetTranscript: number;
}

function downloadAudioFiles(
  items: { [key: string]: { audio: HTMLAudioElement } },
) {
  const timestamp = new Date().getTime();
  const nicelyFormattedTimestamp = new Date(timestamp).toISOString().slice(0, 19)
    .replace(/[-:]/g, "-");

  // If there's only one item, download it directly
  if (Object.keys(items).length === 1) {
    const singleAudio = Object.values(items)[0].audio;
    fetch(singleAudio.src)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audio-${nicelyFormattedTimestamp}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
      });
    return;
  }

  // For multiple items, download all MP3s first
  const mp3Promises = Object.values(items).map(item =>
    fetch(item.audio.src)
      .then(response => response.blob())
  );

  Promise.all(mp3Promises)
    .then(blobs => {
      // Combine all MP3 blobs into a single blob
      const combinedBlob = new Blob(blobs, { type: 'audio/mp3' });

      // Create download link for combined file
      const url = URL.createObjectURL(combinedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audio-${nicelyFormattedTimestamp}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    });
}

function ChatTemplate(
  {
    settings,
    lang,
    parentImages,
    messages,
    currentEditIndex,
    audioFileDict,
    onRefreshAction,
    onEditAction,
    onSpeakAtGroupIndexAction,
    onImageChange,
    startStream,
    query,
    setQuery,
    handleImagesUploaded,
    children,
    resetTranscript,
  }: ChatTemplateProps
) {
  const [images, setImages] = useState<Image[]>([]);
  const [imageFiles, setImageFiles] = useState<Image[]>([]);

  const [sidebarData, setSidebarData] = useState<{
    type: "webResults" | "graph" | "game";
    results: any[];
  }[]>([]);

  const isApiConfigured = settings.universalApiKey ||
    (settings.apiKey && settings.apiModel && settings.apiUrl)

  const deleteImage = (event: MouseEvent) => {
    const target = event.target as HTMLImageElement;
    const index = images.findIndex((image) => image.image_url.url === target.src);
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    newImages.splice(index, 1);
    newImageFiles.splice(index, 1);
    setImages(newImages);
    setImageFiles(newImageFiles);
    onImageChange(newImageFiles);
  };

  useEffect(() => {
    setImages(parentImages);
  }, [parentImages]);

  useEffect(() => {
    // Try to parse JSON data from the last message if it's from the assistant
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        try {
          const content = Array.isArray(lastMessage.content)
            ? lastMessage.content.join("")
            : lastMessage.content;

          // Find JSON substring between triple backticks
          const jsonMatch = content.match(/```(graphjson|webresultjson|gamejson)\n([\s\S]*?)\n(endgraphjson|endwebresultjson|endgamejson)```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[2]);
            if (jsonData.type === "webResults" || jsonData.type === "graph" || jsonData.type === "game") {
              setSidebarData([jsonData]);
              return;
            }
          }

        } catch (error) {
          console.error("Error parsing JSON from AI response:", error);
        }
      }
    }
  }, [messages]);

  return (
    <>
      <div class="flex-grow h-full grid grid-rows-[auto_1fr_auto]">
        <LogoHeader lang={lang}/>
        <div
          class={messages?.length === 0
            ? `bg-transparent`
            : `chat-history flex flex-col w-full mx-auto overflow-auto flex-grow-0 max-h-[74vh]`}
        >
          {messages?.map((item, groupIndex) => (
            <Message
              key={groupIndex}
              item={item}
              groupIndex={groupIndex}
              currentEditIndex={currentEditIndex}
              audioFileDict={audioFileDict}
              onEditAction={onEditAction}
              onRefreshAction={onRefreshAction}
              onSpeakAtGroupIndexAction={onSpeakAtGroupIndexAction}
              onDownloadAudio={downloadAudioFiles}
            />
          ))}
          {images.length > 0 && (
            <div class="w-full flex justify-center">
              <div class="p-2 flex flex-wrap max-w-xs gap-8">
                {images.map((image, index) => (
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
          {children}

        </div>

        {!isApiConfigured
          && (
            <div className="relative bg-gray-700 rounded-md">
              <div className="text-center text-md p-4 text-white">
                {chatIslandContent[lang]["noSettings"]}
              </div>
            </div>
          )}

        <div className="relative">
          <textarea
            disabled={!isApiConfigured}
            type="text"
            value={query}
            placeholder={chatIslandContent[lang]["placeholderText"]}
            onInput={(e) => {
              const textarea = e.currentTarget;
              textarea.style.height = "auto"; // Reset height to auto to get the correct new height
              textarea.style.height = textarea.scrollHeight + "px"; // Set new height
              setQuery(textarea.value); // Update query and possibly the messages array
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevents adding a new line in the textarea
                startStream("");
              }
            }}
            class="h-auto w-full min-h-[10rem] py-4 pl-4 pr-16 border border-gray-300 rounded-lg focus:outline-none cursor-text focus:border-orange-200 focus:ring-1 focus:ring-orange-300 shadow-sm resize-none placeholder-gray-400 text-base font-medium overflow-hidden bg-white disabled:cursor-not-allowed"
          />

          <ImageUploadButton
            onImagesUploaded={handleImagesUploaded}
            disabled={!isApiConfigured}
          />

          <VoiceRecordButton
            disabled={!isApiConfigured}
            resetTranscript={resetTranscript}
            sttUrl={settings.sttUrl}
            sttKey={settings.sttKey}
            sttModel={settings.sttModel}
            onFinishRecording={(finalTranscript) => {
              startStream(finalTranscript);
            }}
            onInterimTranscript={(interimTranscript) => {
              setQuery(query + " " + interimTranscript);
            }}
          />

          <ChatSubmitButton
            onMouseDown={() => startStream("")}
            disabled={!query}
            disabled={!isApiConfigured}
          />
        </div>
      </div>
      <RightSidebar data={sidebarData}  />
    </>
  );
}

export default ChatTemplate;
