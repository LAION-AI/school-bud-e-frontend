// ###############
// ### IMPORTS ###
// ###############

// The ChatIsland component is responsible for managing the chat messages and audio playback.
import ChatTemplate from "../components/ChatTemplate.tsx";
import ChatWarning from "../components/Warning.tsx";

// Necessary for streaming service
import { useEffect, useState } from "preact/hooks";

// // Import necessary types from Preact
import Sidebar from "./Sidebar.tsx";
import { getTTS, readAlways, stopList } from "../components/chat/speech.ts";
import { autoScroll, chatSuffix, currentEditIndex, deleteAllChats, handleRefreshAction, messages, saveChatsToLocalFile, startNewChat } from "../components/chat/store.ts";

// ###############
// ## / IMPORTS ##
// ###############


// Define the AudioItem interface if not already defined
interface AudioItem {
  audio: HTMLAudioElement;
  played: boolean;
}

// Define the AudioFileDict type if not already defined
type AudioFileDict = Record<number, Record<number, AudioItem>>;

export default function ChatIsland({ lang }: { lang: string }) {
  // Necessary to load the chat messages from localStorage only once

  // dictionary containg audio files for each groupIndex for the current chat
  const [audioFileDict, setAudioFileDict] = useState<AudioFileDict>({});

  // used for STT in VoiceRecordButton
  const [resetTranscript, setResetTranscript] = useState(0);

  // General settings
  const [isStreamComplete, setIsStreamComplete] = useState(true);


  // Add useEffect for loading settings

  // #################
  // ### useEffect ###
  // #################
  // Explanation: If a value changes, the useEffect hook is called. This is useful for side effects like fetching data or updating the DOM.

  // 2. useEffect [isStreamComplete]: Save chat messages to localStorage when the stream is complete
  // 3. useEffect [messages]: Automatic scrolling to last message on incoming messages
  // 4. useEffect [currentChatSuffix]: Load messages from localStorage when the chat suffix changes
  // 5. useEffect [audioFileDict, readAlways, stopList.value]: Play incoming audio files when readAlways is true


  // 2. useEffect [isStreamComplete]
  useEffect(() => {
    const lastMessage = messages.value[messages.value.length - 1];
    if (isStreamComplete && lastMessage) {
      if ("content" in messages.value[messages.value.length - 1]) {
        let lastMessageFromBuddy: string;
        const lastMessageContent = messages.value[messages.value.length - 1]["content"];

        if (typeof lastMessageContent === "string") {
          lastMessageFromBuddy = lastMessageContent;
        } else {
          lastMessageFromBuddy = (lastMessageContent as string[]).join("");
        }

        if (lastMessageFromBuddy !== "" && messages.value.length > 1) {
          messages.value[messages.value.length - 1]["content"] = lastMessageFromBuddy;

          console.log("IS_STREAM_COMPLETE", chatSuffix.value);
        }
        if (lastMessageFromBuddy !== "") {
          const groupIndex = messages.value.length - 1;
          if (groupIndex === 0) {
            // TODO: Enable TTS
            getTTS(lastMessageFromBuddy, groupIndex, "stream");
          }
        }
      }
    }
  }, [isStreamComplete]);



  // 5. useEffect [audioFileDict, readAlways, stopList.value]
  useEffect(() => {
    if (!readAlways) return;

    Object.entries(audioFileDict).forEach(([groupIndex, groupAudios]) => {
      const nextUnplayedIndex = findNextUnplayedAudio(groupAudios);

      if (nextUnplayedIndex === null) return;

      const isLatestGroup =
        Math.max(...Object.keys(audioFileDict).map(Number)) <=
        Number(groupIndex);

      if (
        isLatestGroup &&
        canPlayAudio(
          Number(groupIndex),
          nextUnplayedIndex,
          groupAudios,
          stopList.value,
        )
      ) {
        playAudio(
          groupAudios[nextUnplayedIndex].audio,
          Number(groupIndex),
          nextUnplayedIndex,
          audioFileDict,
          setAudioFileDict,
        );
      }

      if (stopList.value.includes(Number(groupIndex))) {
        (Object.values(groupAudios) as AudioItem[]).forEach((item) => {
          if (!(item as AudioItem).audio.paused) {
            (item as AudioItem).audio.pause();
            (item as AudioItem).audio.currentTime = 0;
          }
        });
      }
    });
  }, [audioFileDict, readAlways, stopList.value]);

  // Helper functions for audio playback
  const findNextUnplayedAudio = (
    groupAudios: Record<number, AudioItem>,
  ): number | null => {
    const [nextUnplayed] = Object.entries(groupAudios)
      .sort(([a], [b]) => Number(a) - Number(b))
      .find(([_, item]) => !item.played) || [];
    return nextUnplayed ? Number(nextUnplayed) : null;
  };

  const canPlayAudio = (
    groupIndex: number,
    audioIndex: number,
    groupAudios: Record<number, AudioItem>,
    stopList: number[],
  ): boolean => {
    if (stopList.includes(Number(groupIndex))) return false;

    const previousAudio = groupAudios[audioIndex - 1];
    return audioIndex === 0 ||
      (previousAudio?.played && previousAudio?.audio.paused);
  };

  const playAudio = (
    audio: HTMLAudioElement,
    groupIndex: number,
    audioIndex: number,
    audioFileDict: AudioFileDict,
    setAudioFileDict: (dict: AudioFileDict) => void,
  ) => {
    audio.play();
    audioFileDict[groupIndex][audioIndex].played = true;

    // Add onended handler to update state when audio finishes
    audio.onended = () => {
      audioFileDict[groupIndex][audioIndex].played = true;
      setAudioFileDict({ ...audioFileDict }); // Force state update
    };

    // Force immediate state update when starting playback
    setAudioFileDict({ ...audioFileDict });
  };

  // MAIN CONTENT THAT IS RENDERED
  return (
    <div class="grid grid-cols-[auto_1fr_auto] w-full h-[calc(100vh-64px)]">
      <Sidebar
        currentChatSuffix={chatSuffix.value}
        onChatSelect={(suffix) => chatSuffix.value = (suffix)}
        onDownloadChat={saveChatsToLocalFile}
        onNewChat={startNewChat}
        lang={lang}
        onDeleteAllChats={deleteAllChats}
      />
      <ChatTemplate
        messages={messages.value}
        currentEditIndex={currentEditIndex.value}
        audioFileDict={audioFileDict}
        onRefreshAction={handleRefreshAction}
        onEditAction={() => { }}
        onSpeakAtGroupIndexAction={() => { }}
        onImageChange={() => { }}
        handleImagesUploaded={() => { }}
        onUploadActionToMessages={() => { }}
        resetTranscript={resetTranscript}
      >
        <ChatWarning lang={lang} />
      </ChatTemplate>
    </div>
  );
}
