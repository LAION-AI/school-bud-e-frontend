import { useEffect, useState } from "preact/hooks";
import { chatIslandContent, headerContent } from "../internalization/content.ts";
import type { JSX } from 'preact';
import { ChatSubmitButton } from "./ChatSubmitButton.tsx";
import VoiceRecordButton from "./VoiceRecordButton.tsx";
import ImageUploadButton from "./ImageUploadButton.tsx";
import { MessageContent } from "./MessageContent.tsx";
import RightSidebar from "../islands/RightSidebar.tsx";

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
    type: "webResults" | "graph";
    results: any[];
  } | undefined>();

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
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            if (jsonData.type === "webResults" || jsonData.type === "graph") {
              setSidebarData(jsonData);
              return;
            }
          }
          setSidebarData(undefined);
        } catch (error) {
          console.error("Error parsing JSON from AI response:", error);
          setSidebarData(undefined);
        }
      }
    }
  }, [messages]);

  return (
    <div class="flex">
      <div class="flex-grow">

        <div class="flex items-center justify-center px-4 drop-shadow-2xl rounded-md w-full">
          {/* Logo Image */}
          <img
            src="/logo.png"
            width="128"
            height="128"
            alt="A little lion wearing a graduation cap."
          />

          <div class="flex flex-col">
            {/* Over Title */}
            <h2 class="text-gray-600 font-semibold tracking-widest italic">
              {headerContent[lang]["overTitle"]}
            </h2>

            {/* Main Title */}
            <h1 class="text-4xl text-gray-600 font-semibold block self-center">
              {headerContent[lang]["title"]}
            </h1>
          </div>
        </div>

        <div
          class={messages?.length === 0
            ? `bg-transparent`
            : `chat-history flex flex-col space-y-4 w-full mx-auto overflow-auto flex-grow-0 max-h-[60vh]`}
        >
          {messages?.map((item, groupIndex) => {
            return (
              <div
                key={groupIndex}
                class={`message-group flex flex-col ${item.role === "user" ? "items-end" : "items-start"
                  }`}
              >
                <span
                  class={`text-sm font-semibold flex justify-center items-center ${item.role === "user" ? "text-blue-600" : "text-gray-600"
                    }`}
                >
                  {item.role === "user" ? "Du" : "Bud-E"}
                  {groupIndex !== 0 && (
                    <button onClick={() => onEditAction(groupIndex)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={`margin-left: 0.5rem; width: 24px; height: 24px; ${currentEditIndex === groupIndex ? "fill: red;" : "fill: grey;"}`}
                        viewBox="0 -960 960 960"
                        fill="grey"
                      >
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 17l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-648L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                      </svg>
                    </button>
                  )}

                  {item.role !== "user" && groupIndex !== 0 && (
                    <button onClick={() => onRefreshAction(groupIndex)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style="margin-left: 0.5rem; width: 24px; height: 24px;"
                        viewBox="0 -960 960 960"
                        fill="grey"
                      >
                        <path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z" />
                      </svg>
                    </button>
                  )}
                  {item.role !== "user" && (
                    <button onClick={() => onSpeakAtGroupIndexAction(groupIndex)}>
                      {!audioFileDict[groupIndex] ||
                        !Object.values(audioFileDict[groupIndex]).some((
                          audioFile,
                        ) =>
                          !audioFile.audio.paused
                        )
                        ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            style="margin-left: 0.5rem; width: 24px; height: 24px;"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                          >
                            <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" />
                          </svg>
                        )
                        : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            style="margin-left: 0.5rem; width: 24px; height: 24px;"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                          >
                            <path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                          </svg>
                        )}
                    </button>
                  )}
                  {item.role !== "user" && audioFileDict[groupIndex] &&
                    Object.keys(audioFileDict[groupIndex]).length > 0 && (
                      // download audio file audioFileDict[groupIndex][0].audio.src to local files
                      <button
                        onClick={() =>
                          downloadAudioFiles(audioFileDict[groupIndex])}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          style="margin-left: 0.5rem; width: 24px; height: 24px;"
                          viewBox="0 -960 960 960"
                          fill="currentColor"
                        >
                          <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                        </svg>
                      </button>
                    )}
                </span>
                <div
                  class={`message mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] ${item.role === "user"
                    ? "bg-blue-100"
                    : "bg-gray-50"
                    } p-4 w-full mx-auto`}
                >
                  <MessageContent content={item.content} />
                </div>
              </div>
            );
          })}
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
      <div class="transition-none w-[30vw] ml-4">
        <RightSidebar data={sidebarData} />
      </div>
    </div>
  );
}

export default ChatTemplate;
