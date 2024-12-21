// ###############
// ### IMPORTS ###
// ###############

// The ChatIsland component is responsible for managing the chat messages and audio playback.
import ChatTemplate from "../components/ChatTemplate.tsx";

// Buttons separated from ChatTemplate to avoid circular dependencies
import { ChatSubmitButton } from "../components/ChatSubmitButton.tsx";
import ImageUploadButton from "../components/ImageUploadButton.tsx";
import VoiceRecordButton from "../components/VoiceRecordButton.tsx";

// Necessary for streaming service
import {
  EventSourceMessage,
  fetchEventSource,
} from "https://esm.sh/@microsoft/fetch-event-source@2.0.1";
import { useEffect, useState } from "preact/hooks";

// Internalization
import { chatIslandContent } from "../internalization/content.ts";

// // Import necessary types from Preact
// import { JSX } from 'preact';
import Settings from "../components/Settings.tsx";

// ###############
// ## / IMPORTS ##
// ###############

class RetriableError extends Error { }
class FatalError extends Error { }

// Define the AudioItem interface if not already defined
interface AudioItem {
  audio: HTMLAudioElement;
  played: boolean;
}

// Define the AudioFileDict type if not already defined
type AudioFileDict = Record<number, Record<number, AudioItem>>;

export default function ChatIsland({ lang }: { lang: string }) {
  // Necessary to load the chat messages from localStorage only once
  const [firstLoad, setFirstLoad] = useState(true);

  // Multiple chats can be stored in localStorage, each chat is identified by a unique suffix
  const [query, setQuery] = useState("");
  const [currentChatSuffix, setCurrentChatSuffix] = useState("0");
  const [localStorageKeys, setLocalStorageKeys] = useState([] as string[]);

  // dictionary containg audio files for each groupIndex for the current chat
  const [audioFileDict, setAudioFileDict] = useState<AudioFileDict>({});

  // used for STT in VoiceRecordButton
  const [resetTranscript, setResetTranscript] = useState(0);

  // General settings
  const [readAlways, setReadAlways] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [images, setImages] = useState([] as Image[]);
  const [isStreamComplete, setIsStreamComplete] = useState(true);
  const [stopList, setStopList] = useState([] as number[]);
  const [currentEditIndex, setCurrentEditIndex] = useState(-1 as number | undefined);

  const [messages, setMessages] = useState([
    {
      "role": "assistant",
      "content": [chatIslandContent[lang]["welcomeMessage"]],
    },
  ] as Message[]);

  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState({
    apiUrl: localStorage.getItem("bud-e-api-url") || "",
    apiKey: localStorage.getItem("bud-e-api-key") || "",
    apiModel: localStorage.getItem("bud-e-model") || "",
    ttsUrl: localStorage.getItem("bud-e-tts-url") || "",
    ttsKey: localStorage.getItem("bud-e-tts-key") || "",
    ttsModel: localStorage.getItem("bud-e-tts-model") || "",
    sttUrl: localStorage.getItem("bud-e-stt-url") || "",
    sttKey: localStorage.getItem("bud-e-stt-key") || "",
    sttModel: localStorage.getItem("bud-e-stt-model") || "",
    systemPrompt: localStorage.getItem("bud-e-system-prompt") || "",
    vlmUrl: localStorage.getItem("bud-e-vlm-url") || "",
    vlmKey: localStorage.getItem("bud-e-vlm-key") || "",
    vlmModel: localStorage.getItem("bud-e-vlm-model") || "",
    vlmCorrectionModel: localStorage.getItem("bud-e-vlm-correction-model") || "",
  });

  // Add useEffect for loading settings
  useEffect(() => {
    const savedSettings = {
      apiUrl: localStorage.getItem("bud-e-api-url") || "",
      apiKey: localStorage.getItem("bud-e-api-key") || "",
      apiModel: localStorage.getItem("bud-e-model") || "",
      ttsUrl: localStorage.getItem("bud-e-tts-url") || "",
      ttsKey: localStorage.getItem("bud-e-tts-key") || "",
      ttsModel: localStorage.getItem("bud-e-tts-model") || "",
      sttUrl: localStorage.getItem("bud-e-stt-url") || "",
      sttKey: localStorage.getItem("bud-e-stt-key") || "",
      sttModel: localStorage.getItem("bud-e-stt-model") || "",
      systemPrompt: localStorage.getItem("bud-e-system-prompt") || "",
      vlmUrl: localStorage.getItem("bud-e-vlm-url") || "",
      vlmKey: localStorage.getItem("bud-e-vlm-key") || "",
      vlmModel: localStorage.getItem("bud-e-vlm-model") || "",
      vlmCorrectionModel: localStorage.getItem("bud-e-vlm-correction-model") || "",
    };
    setSettings(savedSettings);
  }, []);

  const handleSaveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem("bud-e-api-url", newSettings.apiUrl);
    localStorage.setItem("bud-e-api-key", newSettings.apiKey);
    localStorage.setItem("bud-e-model", newSettings.apiModel);
    localStorage.setItem("bud-e-tts-url", newSettings.ttsUrl);
    localStorage.setItem("bud-e-tts-key", newSettings.ttsKey);
    localStorage.setItem("bud-e-tts-model", newSettings.ttsModel);
    localStorage.setItem("bud-e-stt-url", newSettings.sttUrl);
    localStorage.setItem("bud-e-stt-key", newSettings.sttKey);
    localStorage.setItem("bud-e-stt-model", newSettings.sttModel);
    localStorage.setItem("bud-e-system-prompt", newSettings.systemPrompt);
    localStorage.setItem("bud-e-vlm-url", newSettings.vlmUrl);
    localStorage.setItem("bud-e-vlm-key", newSettings.vlmKey);
    localStorage.setItem("bud-e-vlm-model", newSettings.vlmModel);
    localStorage.setItem(
      "bud-e-vlm-correction-model",
      newSettings.vlmCorrectionModel
    );
    setShowSettings(false);
  };

  // #################
  // ### useEffect ###
  // #################
  // Explanation: If a value changes, the useEffect hook is called. This is useful for side effects like fetching data or updating the DOM.

  // 1. useEffect []: Load chat messages from localStorage on first load
  // 2. useEffect [isStreamComplete]: Save chat messages to localStorage when the stream is complete
  // 3. useEffect [messages]: Automatic scrolling to last message on incoming messages
  // 4. useEffect [currentChatSuffix]: Load messages from localStorage when the chat suffix changes
  // 5. useEffect [audioFileDict, readAlways, stopList]: Play incoming audio files when readAlways is true

  // 1. useEffect
  // Runs once on startup to load the chat messages from localStorage
  useEffect(() => {
    let localStorageKeys: string[] = Object.keys(localStorage).filter((key) =>
      key.startsWith("bude-chat-")
    );
    localStorageKeys = localStorageKeys.length > 0
      ? localStorageKeys
      : ["bude-chat-0"];
    const currentChatSuffix = localStorageKeys.length > 0
      ? String(localStorageKeys.sort()[0].slice(10))
      : "0";
    let localStorageMessages = JSON.parse(
      String(localStorage.getItem("bude-chat-" + currentChatSuffix)),
    );
    localStorageMessages = localStorageMessages || [
      {
        "role": "assistant",
        "content": [
          chatIslandContent[lang]["welcomeMessage"],
        ],
      },
    ];
    setLocalStorageKeys(localStorageKeys);
    setMessages(localStorageMessages);
    setCurrentChatSuffix(currentChatSuffix);
  }, []);

  // 2. useEffect [isStreamComplete]
  useEffect(() => {
    if (isStreamComplete) {
      if ("content" in messages[messages.length - 1]) {
        let lastMessageFromBuddy: string;
        const lastMessageContent = messages[messages.length - 1]["content"];

        if (typeof lastMessageContent === "string") {
          lastMessageFromBuddy = lastMessageContent;
        } else {
          lastMessageFromBuddy = (lastMessageContent as string[]).join("");
        }

        if (lastMessageFromBuddy !== "" && messages.length > 1) {
          messages[messages.length - 1]["content"] = lastMessageFromBuddy;

          console.log("IS_STREAM_COMPLETE", currentChatSuffix);
          localStorage.setItem(
            "bude-chat-" + currentChatSuffix,
            JSON.stringify(messages),
          );

          if (!localStorageKeys.includes("bude-chat-" + currentChatSuffix)) {
            setLocalStorageKeys([
              ...localStorageKeys,
              "bude-chat-" + currentChatSuffix,
            ]);
          }
        }
        if (lastMessageFromBuddy !== "") {
          const groupIndex = messages.length - 1;
          if (groupIndex === 0) {
            getTTS(lastMessageFromBuddy, groupIndex, "stream");
          }
        }
      }
    }
  }, [isStreamComplete]);

  // 3. useEffect [messages]
  useEffect(() => {
    if (autoScroll) {
      // Only proceed if we're not already scrolling
      const currentPosition = globalThis.innerHeight +
        globalThis.scrollY;
      const totalScrollHeight = document.body.scrollHeight;

      // Only scroll if the deviation is more than 100 pixels
      if (totalScrollHeight - currentPosition > 500) {
        globalThis.scrollTo({
          top: totalScrollHeight,
          behavior: "smooth",
        });
      }
    }

    if (!firstLoad) {
      // console.log("MESSAGES", currentChatSuffix);
      localStorage.setItem(
        "bude-chat-" + currentChatSuffix,
        JSON.stringify(messages),
      );
      setLocalStorageKeys(
        Object.keys(localStorage).filter((key) => key.startsWith("bude-chat-")),
      );
    }

    if (firstLoad) {
      setFirstLoad(false);
    }
  }, [messages, autoScroll]);

  // 4. useEffect [currentChatSuffix]
  useEffect(() => {
    // load messages from localStorage if they exist, else start with the default introductory message
    const localStorageMessages = JSON.parse(
      String(localStorage.getItem("bude-chat-" + currentChatSuffix)),
    ) || [
        {
          "role": "assistant",
          "content": [
            chatIslandContent[lang]["welcomeMessage"],
          ],
        },
      ];
    if (localStorageMessages.length === 1) {
      if (
        localStorageMessages[0].content[0] !==
        chatIslandContent[lang]["welcomeMessage"]
      ) {
        localStorageMessages[0].content[0] =
          chatIslandContent[lang]["welcomeMessage"];
      }
    }
    setMessages(localStorageMessages);
    stopAndResetAudio();
    setStopList([]);
  }, [currentChatSuffix]);

  // 5. useEffect [audioFileDict, readAlways, stopList]
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
          stopList,
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

      if (stopList.includes(Number(groupIndex))) {
        (Object.values(groupAudios) as AudioItem[]).forEach((item) => {
          if (!(item as AudioItem).audio.paused) {
            (item as AudioItem).audio.pause();
            (item as AudioItem).audio.currentTime = 0;
          }
        });
      }
    });
  }, [audioFileDict, readAlways, stopList]);

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

  // Handle functions that interact with the chatTemplate
  // 1. handleRefreshAction: repeats query at given groupIndex
  // 2. handleEditAction: edits query at given groupIndex
  // 3. handleOnSpeakAtGroupIndexAction: plays audio at given groupIndex
  // 4. handleUploadActionToMessages: uploads from local file to messages

  // 1. handleRefreshAction
  const handleRefreshAction = (groupIndex: number) => {
    if (groupIndex > 0 && groupIndex <= messages.length) {
      const slicedMessages = messages.slice(0, groupIndex - 1) as Message[];
      setMessages(slicedMessages);

      // const lastMessage = isArray(messages[groupIndex - 1]["content"]) ;
      const refreshMessage = Array.isArray(messages[groupIndex - 1]["content"])
        ? messages[groupIndex - 1]["content"]
        : messages[groupIndex - 1]["content"];

      setStopList([]);
      startStream(refreshMessage as string, slicedMessages);
    }
  };

  // 2. handleEditAction
  const handleEditAction = (groupIndex: number) => {
    const message = messages[groupIndex];
    let contentToEdit = "";

    if (typeof message.content === "string") {
      contentToEdit = message.content;
    } else if (Array.isArray(message.content)) {
      if (typeof message.content[0] === "string") {
        contentToEdit = message.content.join("");
      } else {
        // Handle content array of objects with text and image_url
        contentToEdit = message.content
          .filter(item => item.type === "text")
          .map(item => item.text)
          .join("");
      }
    }

    // setMessages((prevMessages) => prevMessages.slice(0, groupIndex));
    setQuery(contentToEdit);
    setStopList([]);
    setCurrentEditIndex(groupIndex, u);

    const textarea = document.querySelector("textarea");
    textarea!.focus();
  };

  // 3. handleOnSpeakAtGroupIndexAction
  const handleOnSpeakAtGroupIndexAction = (groupIndex: number) => {
    console.log("[LOG] handleOnSpeakAtGroupIndexAction", groupIndex);
    if (!audioFileDict[groupIndex]) {
      console.log("No audio file found for groupIndex", groupIndex);
      console.log("AudioFileDict", audioFileDict);
      const lastMessage = Array.isArray(messages[groupIndex])
        ? messages[groupIndex][0]
        : messages[groupIndex];
      console.log("lastMessage", lastMessage);
      const parsedLastMessage = Array.isArray(lastMessage["content"])
        ? lastMessage["content"].join("")
        : lastMessage["content"];
      if (parsedLastMessage === "") return;
      getTTS(
        parsedLastMessage as string,
        groupIndex,
        "handleOnSpeakAtGroupIndexAction",
      );
      return;
    } else {
      const indexThatIsPlaying = Object.entries(audioFileDict[groupIndex])
        .findIndex(([_, item]) => !item.audio.paused);

      if (indexThatIsPlaying !== -1) {
        // Pause current audio
        // audioFileDict[groupIndex][indexThatIsPlaying].audio.pause();
        // audioFileDict[groupIndex][indexThatIsPlaying].audio.currentTime = 0;

        (Object.values(audioFileDict) as Record<number, AudioItem>[]).forEach(
          (group) => {
            (Object.values(group) as AudioItem[]).forEach((item) => {
              if (!item.audio.paused) {
                item.audio.pause();
                item.audio.currentTime = 0;
              }
            });
          },
        );

        setStopList([...stopList, groupIndex]);
        // Force state update after pausing
        setAudioFileDict({ ...audioFileDict });
      } else {
        setStopList(stopList.filter((item) => item !== groupIndex));
        // Stop all other playing audio
        (Object.values(audioFileDict) as Record<number, AudioItem>[]).forEach(
          (group) => {
            (Object.values(group) as AudioItem[]).forEach((item) => {
              if (!item.audio.paused) {
                item.audio.pause();
                item.audio.currentTime = 0;
              }
            });
          },
        );

        // Start playback of current group
        const firstAudio = audioFileDict[groupIndex][0].audio;
        firstAudio.play();

        // Set up sequential playback
        Object.keys(audioFileDict[groupIndex]).forEach((_, index) => {
          const currentAudio = audioFileDict[groupIndex][index].audio;
          currentAudio.onended = () => {
            if (audioFileDict[groupIndex][index + 1]) {
              audioFileDict[groupIndex][index + 1].audio.play();
            }
            // Update state after each audio finishes
            setAudioFileDict({ ...audioFileDict });
          };
        });

        // Force immediate state update when starting playback
        setAudioFileDict({ ...audioFileDict });
      }

      setAudioFileDict({ ...audioFileDict });
    }
  };

  // 4. handleUploadActionToMessages
  const handleUploadActionToMessages = (uploadedMessages: Message[]) => {
    console.log("From hanldeUploadActionToMessages");
    console.log(uploadedMessages);
    const newMessages = uploadedMessages.map((msg) => [msg]).flat();
    newMessages[newMessages.length - 1] = newMessages[newMessages.length - 1];
    setMessages(newMessages);
    const textarea = document.querySelector("textarea");
    textarea!.focus();
  };

  const handleImagesUploaded = (newImages: Image[]) => {
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleImageChange = (images: Image[]) => {
    console.log("Images from ChatIsland: ", images);

    setImages(images);
  };

  // BILDUNGSPLAN
  const fetchBildungsplan = async (query: string, top_n: number) => {
    try {
      const response = await fetch("/api/bildungsplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          top_n: top_n,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as BildungsplanResponse;

      return data;
    } catch (error) {
      console.error("Error in bildungsplan API:", error);
    }
  };

  // WIKIPEDIA
  const fetchWikipedia = async (
    text: string,
    collection: string,
    n: number,
  ) => {
    try {
      const response = await fetch("/api/wikipedia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          collection: collection,
          n: n,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as WikipediaResult[];

      return data;
    } catch (error) {
      console.error("Error in wikipedia API:", error);
    }
  };

  // PAPERS
  const fetchPapers = async (query: string, limit: number) => {
    try {
      const response = await fetch("/api/papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          limit: limit,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PapersResponse;

      return data;
    } catch (error) {
      console.error("Error in papers API:", error);
    }
  };

  // PRIMARY FUNCTIONS
  // 1. startStream: getting LLM output and streams it to ChatTemplate through messages
  // 2. getTTS: plays audio if
  // 2.1 readAlways is true and new stream comes in or
  // 2.2 the loudspeaker button is clicked in chatTemplate to play groupIndex
  //     (handleOnSpeakAtGroupIndex)

  // 1. startStream
  const startStream = async (transcript: string, prevMessages?: Message[]) => {
    // if currentEditIndex is set, we are editing a message instead of starting the stream
    // except if the currentEditIndex is the last user message, then we do start the stream

    if (currentEditIndex && currentEditIndex !== -1) {
      // set the message at currentEditIndex to the transcript
      const newMessages = [...messages];
      newMessages[currentEditIndex]["content"] = query;
      setMessages(newMessages);
      setQuery("");
      setCurrentEditIndex(-1);
      return;
    }

    // pause all ongoing audio files first
    (Object.values(audioFileDict) as Record<number, AudioItem>[]).forEach(
      (group) => {
        (Object.values(group) as AudioItem[]).forEach((item) => {
          if (!item.audio.paused) {
            item.audio.pause();
          }
          item.audio.currentTime = 0;
        });
      },
    );
    setAudioFileDict({ ...audioFileDict });
    const ongoingStream: string[] = [];
    let currentAudioIndex = 1;
    let ttsFromFirstSentence = false;
    if (isStreamComplete) {
      setIsStreamComplete(false);
      setResetTranscript(resetTranscript + 1);

      const currentQuerry = transcript !== "" ? transcript : query;
      let previousMessages = prevMessages || messages;

      previousMessages = previousMessages.map((msg) => {
        if (typeof msg.content === "string") {
          return msg;
        }
        if (typeof msg.content[0] === "string") {
          return { "role": msg.role, "content": msg.content.join("") };
        }
        return msg;
      });

      const queryWithImages = [];
      if (images.length !== 0) {
        queryWithImages.push({ "type": "text", "text": currentQuerry });
        for (const img of images) {
          queryWithImages.push(img);
        }
      }

      const newMessages = [...previousMessages, {
        "role": "user",
        "content": images.length === 0 ? currentQuerry : queryWithImages,
      }];

      setImages([]);

      setMessages(newMessages as Message[]);

      setQuery("");

      // check if the last message has #bildungsplan in the content (case insensitive)
      // #bildungsplan: wofür braucht man eigentlich trigonometrie:5
      const isBildungsplanInLastMessage = currentQuerry.toLowerCase().includes(
        "#bildungsplan",
      );

      const isWikipediaInLastMessage = currentQuerry.toLowerCase().includes(
        "#wikipedia",
      );

      const isPapersInLastMessage = currentQuerry.toLowerCase().includes(
        "#papers",
      );

      if (isWikipediaInLastMessage) {
        let collection = lang === "en"
          ? "English-ConcatX-Abstract"
          : "German-ConcatX-Abstract";
        if (currentQuerry.toLowerCase().includes("#wikipedia_de")) {
          collection = "German-ConcatX-Abstract";
        }
        if (currentQuerry.toLowerCase().includes("#wikipedia_en")) {
          collection = "English-ConcatX-Abstract";
        }

        const currentQuerrySplit = currentQuerry.split(":");
        const query = currentQuerrySplit[1].trim();
        let n = 5;
        if (currentQuerrySplit.length > 2) {
          n = parseInt(currentQuerry.split(":")[2].trim(), 10);
        }

        const res = await fetchWikipedia(query, collection, n);

        // console.log("[API] wikipedia response", res);

        const beautifulWikipedia = res!.map(
          (result: WikipediaResult, index: number) => {
            const content = Object.values(result)[0];
            return `**${chatIslandContent[lang].result} ${index + 1} ${chatIslandContent[lang].of
              } ${res!.length}**\n**${chatIslandContent[lang].wikipediaTitle
              }**: ${content.Title}\n**${chatIslandContent[lang].wikipediaURL
              }**: ${content.URL}\n**${chatIslandContent[lang].wikipediaContent
              }**: ${content["Concat Abstract"]}\n**${chatIslandContent[lang].wikipediaScore
              }**: ${content.score}\n`;
          },
        ).join("\n\n");

        setMessages((messages) => {
          messages.push({ "role": "assistant", "content": [] });
          const lastArray = messages[messages.length - 1];
          (lastArray.content as string[]).push(beautifulWikipedia);
          return [
            ...messages.slice(0, -1),
            lastArray,
          ];
        });
        setIsStreamComplete(true);
        setQuery("");
        return;
      }

      if (isPapersInLastMessage) {
        const currentQuerrySplit = currentQuerry.split(":");
        const query = currentQuerrySplit[1].trim();
        let limit = 5;
        if (currentQuerrySplit.length > 2) {
          limit = parseInt(currentQuerry.split(":")[2].trim(), 10);
        }

        const response = await fetchPapers(query, limit);

        // console.log("[API] papers response", response);

        const beautifulPapers = response!.payload.items.map(
          (result: PapersItem, index: number) => {
            return `**${chatIslandContent[lang].result} ${index + 1} ${chatIslandContent[lang].of
              } ${response!.payload.items.length}**\n**${chatIslandContent[lang].papersDOI
              }**: ${result.doi}\n**${chatIslandContent[lang].papersDate
              }**: ${result.date_published.substring(0, 10)}\n**${chatIslandContent[lang].papersSubjects
              }**: ${result.subjects.join(", ")}\n**${chatIslandContent[lang].papersTitle
              }**: ${result.title}\n**${chatIslandContent[lang].papersAuthors
              }**: ${result.authors.join(", ")}\n**${chatIslandContent[lang].papersAbstract
              }**: ${result.abstract}\n`;
          },
        ).join("\n\n");

        setMessages((messages) => {
          messages.push({ "role": "assistant", "content": [] });
          const lastArray = messages[messages.length - 1];
          (lastArray.content as string[]).push(beautifulPapers);
          return [
            ...messages.slice(0, -1),
            lastArray,
          ];
        });
        setIsStreamComplete(true);
        setQuery("");
        return;
      }

      if (isBildungsplanInLastMessage) {
        const currentQuerrySplit = currentQuerry.split(":");
        const query = currentQuerrySplit[1].trim();
        let top_n = 5;
        if (currentQuerrySplit.length > 2) {
          top_n = parseInt(currentQuerry.split(":")[2].trim(), 10);
        }

        // console.log("query", query);
        // console.log("top_n", top_n);

        const res = await fetchBildungsplan(query, top_n);

        // console.log("[API] bildungsplan response", res);
        const beautifulBildungsplan = res!.results.map((result, index) => {
          return `**${chatIslandContent[lang].result} ${index + 1} ${chatIslandContent[lang].of
            } ${res!.results.length
            }**\n${result.text}\n\n**Score**: ${result.score}`;
        }).join("\n\n");

        setMessages((messages) => {
          messages.push({ "role": "assistant", "content": [] });
          const lastArray = messages[messages.length - 1];
          (lastArray.content as string[]).push(beautifulBildungsplan);
          return [
            ...messages.slice(0, -1),
            lastArray,
          ];
        });
        setIsStreamComplete(true);
        setQuery("");
        return;
      }

      fetchEventSource("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lang: lang,
          messages: newMessages,
          llmApiUrl: settings.apiUrl,
          llmApiKey: settings.apiKey,
          llmApiModel: settings.apiModel,
          vlmApiUrl: settings.vlmUrl,
          vlmApiKey: settings.vlmKey,
          vlmApiModel: settings.vlmModel,
          vlmCorrectionModel: settings.vlmCorrectionModel,
          systemPrompt: settings.systemPrompt
        }),
        onmessage(ev: EventSourceMessage) {
          const parsedData = JSON.parse(ev.data);
          console.warn("parsedData", parsedData);
          ongoingStream.push(parsedData);
          if (ttsFromFirstSentence === false) {
            const combinedText = ongoingStream.join("");
            // Find last occurrence of .!? that's not after a digit
            const match = combinedText.match(/(?<!\d)[.!?][^.!?]*$/);

            if (match && combinedText.length > 20) {
              const splitIndex = match.index! + 1; // Include the punctuation
              const textToSpeak = combinedText.slice(0, splitIndex);
              const remaining = combinedText.slice(splitIndex);

              if (textToSpeak.trim() !== "") {
                getTTS(
                  textToSpeak,
                  newMessages.length - 1,
                  `stream${currentAudioIndex}`,
                );

                currentAudioIndex++;
                ongoingStream.length = 0; // Clear array
                if (remaining.trim()) {
                  ongoingStream.push(remaining); // Push remaining text
                }
                ttsFromFirstSentence = true;
              }
            }
          } else {
            // check for \n\n in the parsedData, e.g., ' \n\n', or '\n\n ' etc.
            const combinedText = ongoingStream.join("");
            if (
              /\n\n/.test(combinedText.slice(5)) && combinedText.length > 15
            ) {
              console.log(JSON.stringify(combinedText));
              const paragraphSplit = combinedText.split(/\n\n/);
              // console.warn("paragraphSplit", paragraphSplit)
              const textToSpeak = paragraphSplit.slice(0, -1).join("\n\n");

              const remaining = paragraphSplit[paragraphSplit.length - 1];

              getTTS(
                textToSpeak,
                newMessages.length - 1,
                `stream${currentAudioIndex}`,
              );

              currentAudioIndex++;
              ongoingStream.length = 0;
              if (remaining.trim()) {
                ongoingStream.push(remaining);
              }
            }
          }
          setMessages((prevMessagesRoundTwo) => {
            const lastArray =
              prevMessagesRoundTwo[prevMessagesRoundTwo.length - 1];
            (lastArray.content as string[]).push(parsedData);
            return [
              ...prevMessagesRoundTwo.slice(0, -1),
              lastArray,
            ];
          });
        },
        async onopen(response: Response) {
          const prevMessagesRoundTwo = newMessages;
          prevMessagesRoundTwo.push({ "role": "assistant", "content": [] });
          setMessages((prevMessagesRoundTwo) => prevMessagesRoundTwo);
          await true;
          if (response.ok) {
            return; // everything's good
          } else if (
            response.status >= 400 && response.status < 500 &&
            response.status !== 429
          ) {
            // client-side errors are usually non-retriable:
            throw new FatalError();
          } else {
            throw new RetriableError();
          }
        },
        onerror(err: EventSourceMessage) {
          console.error("Stream error:", err);
        },
        onclose() {
          console.log("Stream closed");
          setIsStreamComplete(true);
          setQuery("");
          getTTS(
            ongoingStream.join(""),
            newMessages.length - 1,
            `stream${currentAudioIndex}`,
          );
          console.log("ONGOING STREAM: ", ongoingStream);
        },
      });
    }
  };

  // 2. getTTS
  const getTTS = async (
    text: string,
    groupIndex: number,
    sourceFunction: string,
  ) => {
    // Only return early if readAlways is false AND this is a streaming request
    if (!readAlways && sourceFunction.startsWith("stream")) return;

    console.log("[LOG] getTTS");
    // console.log("text", text);
    // console.log("chatIslandContent[lang][welcomeMessage]", chatIslandContent[lang]["welcomeMessage"]);
    if (
      text === chatIslandContent[lang]["welcomeMessage"]
    ) {
      const audioFile = text === chatIslandContent["de"]["welcomeMessage"]
        ? "./intro.mp3"
        : "./intro-en.mp3";
      const audio = new Audio(audioFile);
      // audioFileDict[groupIndex] = {
      //   0: audio,
      // };
      const sourceFunctionIndex = Number(sourceFunction.replace("stream", "")) -
        1 || 0;
      if (audioFileDict[groupIndex]) {
        audioFileDict[groupIndex][sourceFunctionIndex] = {
          audio: audio,
          played: false,
        };
      } else {
        audioFileDict[groupIndex] = {};
        audioFileDict[groupIndex][sourceFunctionIndex] = {
          audio: audio,
          played: false,
        };
      }

      // all indices < groupIndex should be put to pause and added to stopList
      const newStopList = stopList;
      for (let i = 0; i < groupIndex; i++) {
        if (audioFileDict[i]) {
          (Object.values(audioFileDict[i]) as AudioItem[]).forEach((item) => {
            if (!item.audio.paused) {
              item.audio.pause();
              item.audio.currentTime = 0;
              newStopList.push(i);
            }
          });
        }
      }

      setStopList(newStopList);

      // // // TRYING DIFFERENT SETTER
      setAudioFileDict({ ...audioFileDict });

      // // // WORKING SETTER
      // setAudioFileDict((prev) => ({
      //   ...prev,
      //   [groupIndex]: audioFileDict[groupIndex],
      // }));
      // setAudioFileDict((prev) => ({ ...prev, [groupIndex]: audio }));
      console.log(
        "[LOG] Audio file loaded into audioQueue with groupIndex:",
        groupIndex,
      );
      if (sourceFunction === "handleOnSpeakAtGroupIndexAction") {
        handleOnSpeakAtGroupIndexAction(groupIndex);
      }
      return;
    }

    try {
      // // FOR PRODUCTION WHEN TTS SERVER IS WORKING
      console.log("text for /api/tts", sourceFunction, text);
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          textPosition: sourceFunction,
          voice: lang === "en" ? "Stefanie" : "Florian",
          ttsKey: settings.ttsKey,
          ttsUrl: settings.ttsUrl,
          ttsModel: settings.ttsModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioData = await response.arrayBuffer();
      const audioBlob = new Blob([audioData], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      const startsWithStream = sourceFunction.startsWith("stream");

      if (!audioFileDict[groupIndex]) {
        audioFileDict[groupIndex] = {};
      }

      if (startsWithStream) {
        const sourceFunctionIndex =
          Number(sourceFunction.replace("stream", "")) - 1;
        audioFileDict[groupIndex][sourceFunctionIndex] = {
          audio: audio,
          played: false,
        };
      } else {
        audioFileDict[groupIndex] = {
          0: { audio: audio, played: true },
        };
      }

      setAudioFileDict((prev) => ({
        ...prev,
        [groupIndex]: audioFileDict[groupIndex],
      }));

      if (sourceFunction === "handleOnSpeakAtGroupIndexAction") {
        handleOnSpeakAtGroupIndexAction(groupIndex);
      }
    } catch (error) {
      console.error("Error fetching TTS:", error);
    }
  };

  // General functions
  // 0. toggleAutoScroll
  // 1. toggleReadAlways
  // 2. stopAndResetAudio

  // 0. toggleAutoScroll
  const toggleAutoScroll = (value: boolean) => {
    setAutoScroll(value);
  };

  // 1. toggleReadAlways
  // - toggles readAlways state
  // - stops all audio playback if readAlways is set to false
  // - add all groupIndices to stopList if readAlways is set to false
  const toggleReadAlways = (value: boolean) => {
    setReadAlways(value);
    if (!value) {
      (Object.values(audioFileDict) as Record<number, AudioItem>[]).forEach(
        (group) => {
          (Object.values(group) as AudioItem[]).forEach((item: AudioItem) => {
            if (!item.audio.paused) {
              item.audio.pause();
              item.audio.currentTime = 0;
            }
          });
        },
      );
      setStopList(Object.keys(audioFileDict).map(Number));
    }
  };

  // 2. stopAndResetAudio
  const stopAndResetAudio = () => {
    (Object.values(audioFileDict) as Record<number, AudioItem>[]).forEach(
      (group) => {
        (Object.values(group) as AudioItem[]).forEach((item: AudioItem) => { // Changed from (audio)
          if (!item.audio.paused) { // Changed from !audio.paused
            item.audio.pause(); // Changed from audio.pause()
            item.audio.currentTime = 0; // Changed from audio.currentTime
          }
        });
      },
    );
    setAudioFileDict({});
  };

  // Chat functions overview
  // 1. startNewChat
  // 2. deleteCurrentChat
  // 3. deleteAllChats
  // 4. saveChatsToLocalFile
  // 5. restoreChatsFromLocalFile

  // 1. startNewChat
  const startNewChat = () => {
    const maxValueInChatSuffix = Math.max(
      ...localStorageKeys.map((key) => Number(key.slice(10))),
    );
    const newChatSuffix = String(Number(maxValueInChatSuffix) + 1);
    // console.log([...localStorageKeys, "bude-chat-" + newChatSuffix]);
    setMessages([
      {
        "role": "assistant",
        "content": [
          chatIslandContent[lang]["welcomeMessage"],
        ],
      },
    ]);
    setCurrentChatSuffix(newChatSuffix);
  };

  // 2. deleteCurrentChat
  const deleteCurrentChat = () => {
    if (localStorageKeys.length > 1) {
      localStorage.removeItem("bude-chat-" + currentChatSuffix);

      const nextChatSuffix = localStorageKeys.filter((key: string) =>
        key !== "bude-chat-" + currentChatSuffix
      )[0].slice(10);

      setMessages(
        JSON.parse(
          String(localStorage.getItem("bude-chat-" + nextChatSuffix)),
        ),
      );
      setCurrentChatSuffix(nextChatSuffix);
    } else {
      setMessages([
        {
          "role": "assistant",
          "content": [
            chatIslandContent[lang]["welcomeMessage"],
          ],
        },
      ]);
    }
    stopAndResetAudio();
  };

  // 3. deleteAllChats
  const deleteAllChats = () => {
    localStorage.clear();
    setMessages([
      {
        "role": "assistant",
        "content": [
          chatIslandContent[lang]["welcomeMessage"],
        ],
      },
    ]);
    setLocalStorageKeys([]);
    setCurrentChatSuffix("0");
    stopAndResetAudio();
  };

  // 4. saveChatsToLocalFile
  const saveChatsToLocalFile = () => {
    // deno-lint-ignore no-explicit-any
    const chats = {} as any;
    for (const key of localStorageKeys) {
      chats[key] = JSON.parse(String(localStorage.getItem(key)));
    }
    const chatsString = JSON.stringify(chats);
    const blob = new Blob([chatsString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const currentDate = new Date();
    a.download = `chats-${currentDate.toISOString()}.json`;
    a.click();
  };

  // 5. restoreChatsFromLocalFile
  // deno-lint-ignore no-explicit-any
  const restoreChatsFromLocalFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const chats = JSON.parse(event.target?.result as string);

        // Restore chats to localStorage
        for (const [key, value] of Object.entries(chats)) {
          localStorage.setItem(key, JSON.stringify(value));
        }

        const newChatSuffix = chats
          ? Object.keys(chats).sort()[0].slice(10)
          : "0";
        setLocalStorageKeys(
          Object.keys(localStorage).filter((key) =>
            key.startsWith("bude-chat-")
          ),
        );
        setCurrentChatSuffix(newChatSuffix);
        setMessages(chats["bude-chat-" + newChatSuffix]);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    reader.readAsText(file);
  };

  // MAIN CONTENT THAT IS RENDERED
  return (
    <div class="w-full">
      <div class="flex items-center mb-4 flex-wrap">
        {/* Add settings button next to existing chat buttons */}
        <button
          class="rounded-full bg-slate-200 px-4 py-2 mx-2 mb-2"
          onClick={() => setShowSettings(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41Z"/>
          </svg>
        </button>
        {localStorageKeys.sort().map((key) => {
          // remove bude-chat- from the beginning of the key
          const chatSuffix = key.substring(10);
          return (
            <button
              className={`rounded-full ${chatSuffix === currentChatSuffix
                  ? "bg-slate-400 text-white font-bold"
                  : "bg-slate-200"
                } px-4 py-2 mx-2 mb-2`}
              onClick={() => setCurrentChatSuffix(chatSuffix)}
            >
              {Number(chatSuffix) + 1}
            </button>
          );
        })}
        <button
          class="rounded-full bg-slate-200 px-4 py-2 mx-2 mb-2"
          onClick={() => startNewChat()}
        >
          +
        </button>
        {Object.keys(localStorageKeys).length > 0 && (
          <button
            class="rounded-full bg-red-200 font-bold px-4 py-2 mx-2 mb-2"
            onClick={() => deleteCurrentChat()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="inline-block"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
            >
              <path d="M240-800v200-200 640-9.5 9.5-640Zm0 720q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v174q-19-7-39-10.5t-41-3.5v-120H520v-200H240v640h254q8 23 20 43t28 37H240Zm396-20-56-56 84-84-84-84 56-56 84 84 84-84 56 56-83 84 83 84-56 56-84-83-84 83Z" />
            </svg>
            {chatIslandContent[lang]["deleteCurrentChat"]}
          </button>
        )}
        {Object.keys(localStorageKeys).length > 0 && (
          <button
            class="rounded-full bg-red-200 font-bold px-4 py-2 mx-2 mb-2"
            onClick={() => deleteAllChats()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="inline-block"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
            >
              <path d="M240-800v200-200 640-9.5 9.5-640Zm0 720q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v174q-19-7-39-10.5t-41-3.5v-120H520v-200H240v640h254q8 23 20 43t28 37H240Zm396-20-56-56 84-84-84-84 56-56 84 84 84-84 56 56-83 84 83 84-56 56-84-83-84 83Z" />
            </svg>
            {chatIslandContent[lang]["deleteAllChats"]}
          </button>
        )}
        {Object.keys(localStorageKeys).length > 0 && (
          <button
            class="rounded-full bg-green-200 font-bold px-4 py-2 mx-2 mb-2"
            onClick={() => saveChatsToLocalFile()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="inline"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
            >
              <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
            </svg>
          </button>
        )}
        <input
          type="file"
          id="restoreChatFromLocalFile"
          style="display: none;"
          onChange={(e) => restoreChatsFromLocalFile(e)}
        />
        <button
          class="rounded-full bg-green-200 font-bold px-4 py-2 mx-2 mb-2"
          onClick={() =>
            document.getElementById("restoreChatFromLocalFile")?.click()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="inline"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
          </svg>
        </button>
      </div>
      <ChatTemplate
        lang={lang}
        parentImages={images}
        messages={messages}
        isComplete={isStreamComplete}
        readAlways={readAlways}
        autoScroll={autoScroll}
        audioFileDict={audioFileDict}
        currentEditIndex={currentEditIndex!}
        onSpeakAtGroupIndexAction={handleOnSpeakAtGroupIndexAction}
        onToggleReadAlwaysAction={() => toggleReadAlways(!readAlways)}
        onToggleAutoScrollAction={() => toggleAutoScroll(!autoScroll)}
        onRefreshAction={handleRefreshAction}
        onEditAction={handleEditAction}
        onUploadActionToMessages={handleUploadActionToMessages}
        onImageChange={handleImageChange}
        onTrashAction={() => setMessages([])}
      />

      {showSettings && (
        <Settings 
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
          lang={lang}
        />
      )}

      <div className="relative mt-4 mb-12">
        <textarea
          type="text"
          value={query}
          placeholder={chatIslandContent[lang]["placeholderText"]}
          onInput={(e) => {
            const textarea = e.currentTarget;
            textarea.style.height = "auto"; // Reset height to auto to get the correct new height
            textarea.style.height = textarea.scrollHeight + "px"; // Set new height
            setQuery(e.currentTarget.value); // Update query and possibly the messages array
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Prevents adding a new line in the textarea
              startStream("");
            }
          }}
          class="h-auto w-full min-h-[10rem] py-4 pl-4 pr-16 border border-gray-300 rounded-lg focus:outline-none cursor-text focus:border-orange-200 focus:ring-1 focus:ring-orange-300 shadow-sm resize-none placeholder-gray-400 text-base font-medium overflow-hidden"
        />

        <ImageUploadButton
          onImagesUploaded={handleImagesUploaded}
        />

        <VoiceRecordButton
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
          onClick={() => startStream("")}
          disabled={!query}
        />
      </div>
    </div>
  );
}
