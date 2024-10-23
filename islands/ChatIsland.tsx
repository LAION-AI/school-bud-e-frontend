import { useEffect, useState } from "preact/hooks";
import { fetchEventSource } from "https://esm.sh/@microsoft/fetch-event-source@2.0.1";
import { ChatSubmitButton } from "../components/ChatSubmitButton.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import ChatTemplate from "../components/ChatTemplate.tsx";
import VoiceRecordButton from "../components/VoiceRecordButton.tsx";
import ImageUploadButton from "../components/ImageUploadButton.tsx";

import { chatIslandContent } from "../internalization/content.ts";

class RetriableError extends Error {}
class FatalError extends Error {}

export default function ChatIsland({ lang }: { lang: string }) {
  const [clientId, setClientId] = useState<string | null>("");
  const [localStorageKeys, setLocalStorageKeys] = useState([] as string[]);
  const [currentChatSuffix, setCurrentChatSuffix] = useState("0");
  const [audioFileDict, setAudioFileDict] = useState<AudioFileDict>({});
  const [resetTranscript, setResetTranscript] = useState(0);
  const [readAlways, setReadAlways] = useState(true);
  const [query, setQuery] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const [images, setImages] = useState([] as Image[]);
  const [isStreamComplete, setIsStreamComplete] = useState(true);

  const expectedWelcomeMessage = chatIslandContent[lang]["welcomeMessage"];

  // load messages form localStorage
  const [messages, setMessages] = useState([
    {
      "role": "assistant",
      "content": [
        chatIslandContent[lang]["welcomeMessage"],
      ],
    },
  ] as Message[]);

  
  // Start the chat with the welcome message
  useEffect(() => {
    if (IS_BROWSER) {
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
      getClientId();
    }
  }, []);


  // stopAndResetAudio stops all audio files and resets their currentTime to 0
  const stopAndResetAudio = () => {
    Object.values(audioFileDict).forEach((group) => {
      // deno-lint-ignore no-explicit-any
      Object.values(group).forEach((item: any) => { // Changed from (audio)
        if (!item.audio.paused) { // Changed from !audio.paused
          item.audio.pause(); // Changed from audio.pause()
          item.audio.currentTime = 0; // Changed from audio.currentTime
        }
      });
    });
    setAudioFileDict({});
  };

  // This useEffect is responsible for saving the last message from the buddy to localStorage
  useEffect(() => {
    if (IS_BROWSER) {
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
    }
  }, [isStreamComplete]);

  // This useEffect is responsible for scrolling to the bottom of the chat window when a new message is added
  useEffect(() => {
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

    if (IS_BROWSER && !firstLoad) {
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
  }, [messages]);

  // This useEffect is responsible for loading the messages from localStorage when the currentChatSuffix changes
  useEffect(() => {
    // load messages from localStorage if they exist, else start with the default introductory message
    if (IS_BROWSER) {
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
        if (localStorageMessages[0].content[0] !== expectedWelcomeMessage) {
          localStorageMessages[0].content[0] = expectedWelcomeMessage;
        }
      }
      setMessages(localStorageMessages);
      stopAndResetAudio();
    }
  }, [currentChatSuffix]);

  // This useEffect is responsible for playing the audio files in the audioFileDict
  useEffect(() => {
    console.log("[LOG] audioFileDict useEffect", audioFileDict);

    if (readAlways) {
      for (const groupIndex in audioFileDict) {

        const lowestKeyThatHasPlayedFalse = Number(Object.entries(audioFileDict[groupIndex]).find(([_, item]) => !item.played)?.[0]);

        console.log("lowestKeyThatHasPlayedFalse", lowestKeyThatHasPlayedFalse);

        // check if one index below lowestKeyThatHasPlayedFalse has played True
        const hasMemberBelowThatWasPlayed =
          audioFileDict[groupIndex][lowestKeyThatHasPlayedFalse - 1] &&
          audioFileDict[groupIndex][lowestKeyThatHasPlayedFalse - 1].played &&
          audioFileDict[groupIndex][lowestKeyThatHasPlayedFalse - 1].audio.paused;

        console.log("hasMemberBelowThatWasPlayed", hasMemberBelowThatWasPlayed);

        if (lowestKeyThatHasPlayedFalse === 0 || hasMemberBelowThatWasPlayed) {
          // play the audio that got currently fetched
          console.log("Playing audio at index: ", lowestKeyThatHasPlayedFalse);
          audioFileDict[groupIndex][lowestKeyThatHasPlayedFalse].audio.play();
          audioFileDict[groupIndex][lowestKeyThatHasPlayedFalse].played = true;
          audioFileDict[groupIndex][lowestKeyThatHasPlayedFalse].audio.onended =
            () => {
              setAudioFileDict({ ...audioFileDict });
            };
          setAudioFileDict({ ...audioFileDict });
        }
      }
    }

  }, [audioFileDict]);

  // This useEffect is responsible for playing the audio files in the audioFileDict.
  // It is fired when the loudspeaker icon is clicked for the respected groupIndex in ChatTemplate
  const handleOnSpeakAtGroupIndexAction = (groupIndex: number) => {
    console.log("[LOG] handleOnSpeakAtGroupIndexAction", groupIndex);
    if (!audioFileDict[groupIndex]) {
      console.log("No audio file found for groupIndex", groupIndex);
      const lastMessage = Array.isArray(messages[groupIndex])
        ? messages[groupIndex][0]
        : messages[groupIndex];
      console.log("lastMessage", lastMessage);
      const parsedLastMessage = Array.isArray(lastMessage["content"])
        ? lastMessage["content"].join("")
        : lastMessage["content"];
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
        audioFileDict[groupIndex][indexThatIsPlaying].audio.pause();
        audioFileDict[groupIndex][indexThatIsPlaying].audio.currentTime = 0;
      } else {
        Object.values(audioFileDict).forEach((group) => {
          // deno-lint-ignore no-explicit-any
          Object.values(group).forEach((item: any) => {
            if (!item.audio.paused) {
              item.audio.pause();
              item.audio.currentTime = 0;
            }
          });
        });
        audioFileDict[groupIndex][0].audio.play();
        // set all but the last audio file to play the next audio file in the audioFileDict array
        for (const key of Object.keys(audioFileDict[groupIndex])) {
          audioFileDict[groupIndex][Number(key)].audio.onended = () => {
            if (audioFileDict[groupIndex][Number(key) + 1]) {
              audioFileDict[groupIndex][Number(key) + 1].audio.play();
            }
          };
        }
      }

      setAudioFileDict({ ...audioFileDict });
    }
  };

  // This function is responsible for uploading the messages from the chatIsland to the messages array
  // It is fired when the user uploads a file in the chat
  const handleUploadActionToMessages = (uploadedMessages: Message[]) => {
    console.log("From hanldeUploadActionToMessages");
    console.log(uploadedMessages);
    const newMessages = uploadedMessages.map((msg) => [msg]).flat();
    newMessages[newMessages.length - 1] = newMessages[newMessages.length - 1];
    setMessages(newMessages);
    const textarea = document.querySelector("textarea");
    textarea!.focus();
  };

  // This function is responsible for fetching the client ID from the server
  // It is used in the getTTS function
  const getClientId = async () => {
    const response = await fetch("/api/getClientId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.client_id) {
      setClientId(data.client_id);
    } else {
      console.error("Failed to get client ID");
    }
  };

  // This function is responsible for fetching the TTS audio files from the server
  // It is used in the startStream function, where the incoming messages are split into sentences in 
  // the following way: 
  // --> 1st sentence of the 1st section (if it's > 20 characters) 
  // --> end of 1st abstract 
  // --> 2nd section
  // --> 3rd section etc.
  // This is done to help faster loading of the audio files
  const getTTS = async (
    text: string,
    groupIndex: number,
    sourceFunction: string,
  ) => {
    console.log("[LOG] getTTS");
    if (
      text === chatIslandContent[lang]["welcomeMessage"]
    ) {
      const audioFile = text === chatIslandContent["de"]["welcomeMessage"]
        ? "./intro.wav"
        : "./intro-en.wav";
      const audio = new Audio(audioFile);
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

      setAudioFileDict({ ...audioFileDict });

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
          clientId: clientId,
          textPosition: sourceFunction,
          voice: lang === "en" ? "Stefanie" : "Florian",
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

      setAudioFileDict({ ...audioFileDict });

      if (sourceFunction === "handleOnSpeakAtGroupIndexAction") {
        handleOnSpeakAtGroupIndexAction(groupIndex);
      }

    } catch (error) {
      console.error("Error fetching TTS:", error);
    }
  };

  // This function is responsible for editing the message in the chat at the given groupIndex
  const handleEditAction = (groupIndex: number) => {
    const lastMessage = Array.isArray(messages[groupIndex])
      ? messages[groupIndex][0]
      : messages[groupIndex];

    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.slice(0, groupIndex);
      return updatedMessages;
    });
    setQuery(lastMessage);
    const textarea = document.querySelector("textarea");
    textarea!.focus();
  };

  // This function is responsible for adding the uploaded images to the images array
  const handleImagesUploaded = (newImages: Image[]) => {
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  // This function is responsible for changing the images array in the chat
  const handleImageChange = (images: Image[]) => {
    console.log("Images from ChatIsland: ", images);
    setImages(images);
  };

  // This function is responsible for refreshing the chat at the given groupIndex
  // A new stream is started from the beginning of the message at the given groupIndex
  // It can be used to get a new response from the assistant for the same prompt / message history
  const handleRefreshAction = (groupIndex: number) => {
    if (groupIndex > 0 && groupIndex <= messages.length) {
      const slicedMessages = messages.slice(0, groupIndex - 1) as Message[];
      setMessages(slicedMessages);

      // const lastMessage = isArray(messages[groupIndex - 1]["content"]) ;
      const refreshMessage = Array.isArray(messages[groupIndex - 1]["content"])
        ? messages[groupIndex - 1]["content"]
        : messages[groupIndex - 1]["content"];

      startStream(refreshMessage as string, slicedMessages);
    }
  };

  // This function is responsible for starting a new chat with 
  // the system message "welcomeMessage" in the chatIslandContent
  const startNewChat = () => {
    const maxValueInChatSuffix = Math.max(
      ...localStorageKeys.map((key) => Number(key.slice(10))),
    );
    const newChatSuffix = String(Number(maxValueInChatSuffix) + 1);
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

  // This is the central function of the chatIsland, that is responsible for starting a new stream
  // It is fired when the user presses the "Enter" key in the textarea or clicks the send button
  // It sends the user message to the server and receives a response from the assistant as a stream
  // The stream is split into parts as outlined in the getTTS function section above
  const startStream = (transcript: string, prevMessages?: Message[]) => {
    // pause all ongoing audio files first
    Object.values(audioFileDict).forEach((group) => {
      // deno-lint-ignore no-explicit-any
      Object.values(group).forEach((item: any) => {
        if (!item.audio.paused) {
          item.audio.pause();
        }
        item.audio.currentTime = 0;
      });
    });
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

      fetchEventSource("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lang: lang,
          messages: newMessages,
        }),
        onmessage(ev: TextEvent) {
          const parsedData = JSON.parse(ev.data);
          ongoingStream.push(parsedData);
          if (ttsFromFirstSentence === false) {
            if (/(?<!\d)[.!?]/.test(parsedData) && parsedData.length > 20) {
              getTTS(
                ongoingStream.join(""),
                newMessages.length - 1,
                `stream${currentAudioIndex}`,
              );
              currentAudioIndex++;
              ongoingStream.length = 0;
              ttsFromFirstSentence = true;
            }
          } else {
            // check for \n\n in the parsedData, e.g., ' \n\n', or '\n\n ' etc.
            if (/\n\n/.test(parsedData)) {
              getTTS(
                ongoingStream.join(""),
                newMessages.length - 1,
                `stream${currentAudioIndex}`,
              );
              currentAudioIndex++;
              ongoingStream.length = 0;
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
        onerror(err: TextEvent) {
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

  // This function is responsible for toggling the readAlways state
  // When readAlways is true, the audio files are played automatically
  // when they are fetched from the server
  const toggleReadAlways = (value: boolean) => {
    setReadAlways(value);
    if (!value) {
      Object.values(audioFileDict).forEach((group) => {
        // deno-lint-ignore no-explicit-any
        Object.values(group).forEach((item: any) => {
          if (!item.audio.paused) {
            item.audio.pause();
            item.audio.currentTime = 0;
          }
        });
      });
    }
  };

  // This function is responsible for deleting all chats from the localStorage and the message history
  const deleteAllChats = () => {
    if (IS_BROWSER) {
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
    }
  };

  // This function is responsible for deleting the current chat from the localStorage and the message history
  const deleteCurrentChat = () => {
    if (IS_BROWSER) {
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
    }
  };

  // This function is responsible for saving the chats to a local file
  const saveChatsToLocalFile = () => {
    if (IS_BROWSER) {
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
    }
  };

  // This function is responsible for restoring the chats from a local, uploaded file
  // deno-lint-ignore no-explicit-any
  const restoreChatsFromLocalFile = (e: any) => {
    if (IS_BROWSER) {
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
    }
  };

  // The following html code is the main structure of the chatIsland
  return (
    <div class="w-full">
      {localStorageKeys.sort().map((key) => {
        // remove bude-chat- from the beginning of the key
        const chatSuffix = key.substring(10);
        return (
          <button
            className={`rounded-full ${
              chatSuffix === currentChatSuffix
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
      <ChatTemplate
        lang={lang}
        parentImages={images}
        messages={messages}
        isComplete={isStreamComplete}
        readAlways={readAlways}
        audioFileDict={audioFileDict}
        onSpeakAtGroupIndexAction={handleOnSpeakAtGroupIndexAction}
        onToggleReadAlwaysAction={() => toggleReadAlways(!readAlways)}
        onRefreshAction={handleRefreshAction}
        onEditAction={handleEditAction}
        onUploadActionToMessages={handleUploadActionToMessages}
        onImageChange={handleImageChange}
        onTrashAction={() => setMessages([])}
      />

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
