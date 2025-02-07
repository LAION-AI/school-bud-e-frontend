import { useEffect, useRef, useState } from "preact/hooks";
import { chatIslandContent } from "../internalization/content.ts";
import type { JSX } from 'preact';
import RightSidebar from "../islands/RightSidebar.tsx";
import { Message } from "./Message.tsx";
import LogoHeader from "./core/LogoHeader.tsx";
import { autoScroll, lang, messages, settings } from "./chat/store.ts";
import ChatInput from "./chat/ChatInput.tsx";

interface AudioItem {
  audio: HTMLAudioElement;
  played: boolean;
}

type AudioFileDict = Record<number, Record<number, AudioItem>>;

interface ChatTemplateProps {
  messages: Message[];
  currentEditIndex: number;
  audioFileDict: AudioFileDict;
  onSpeakAtGroupIndexAction: (groupIndex: number) => void;
  onRefreshAction: (groupIndex: number) => void;
  onEditAction: (groupIndex: number) => void;
  onUploadActionToMessages: (uploadedMessages: Message[]) => void;
  onImageChange: (images: Image[]) => void;
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
    currentEditIndex,
    audioFileDict,
    onRefreshAction,
    onEditAction,
    onSpeakAtGroupIndexAction,
    children,
  }: ChatTemplateProps
) {

  const [sidebarData, setSidebarData] = useState<{
    type: string;
    results: any[];
  }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null)

  const isApiConfigured = settings.value.universalApiKey ||
    (settings.value.apiKey && settings.value.apiModel && settings.value.apiUrl)


  useEffect(() => {
    // Try to parse JSON data from the last message if it's from the assistant
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1];
      if (lastMessage.role === "assistant") {
        try {
          const content = Array.isArray(lastMessage.content)
            ? lastMessage.content.join("")
            : lastMessage.content;

          // Find JSON substring between triple backticks
          const jsonMatch = content.match(/```(json)\n([\s\S]*?)\n```/);
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
  }, [messages.value]);

  // 3. useEffect [messages]
  useEffect(() => {
    if (autoScroll.value && chatRef.current) {
      // Only proceed if we're not already scrolling
      const currentPosition = globalThis.innerHeight +
        globalThis.scrollY;
      const totalScrollHeight = chatRef.current.scrollHeight;

      // Only scroll if the deviation is more than 100 pixels
      if (totalScrollHeight - currentPosition > 500) {
        chatRef.current.scrollTo({
          top: totalScrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages.value, autoScroll.value, chatRef]);

  return (
    <>
      <div class="flex-grow flex flex-col min-h-full ">
        {/* <LogoHeader lang={lang.value} /> */}
        <div
          class={messages.value?.length === 0
            ? `bg-transparent`
            : `chat-history flex flex-col w-full overflow-auto flex-grow pt-20`}
            ref={chatRef}
        >
          <div class="h-full px-4 max-w-xl mx-auto w-full">

            {messages.value?.map((item, groupIndex) => (
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
            {children}
          </div>

        </div>

        {!isApiConfigured
          && (
            <div className="relative bg-gray-700 rounded-md">
              <div className="text-center text-md p-4 text-white">
                {chatIslandContent[lang.value]["noSettings"]}
              </div>
            </div>
          )}

        <ChatInput />
      </div>
      <RightSidebar data={sidebarData} />
    </>
  );
}

export default ChatTemplate;
