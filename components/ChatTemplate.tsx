import { useEffect, useState } from "preact/hooks";

import { chatTemplateContent } from "../internalization/content.ts";

function downloadAudioFiles(
  items: { [key: string]: { audio: HTMLAudioElement } },
) {
  let c = 0;
  const timestamp = new Date().getTime();
  // in format "YYYY-MM-DD-HH-MM-SS"
  const nicelyFormattedTimestamp = new Date(timestamp).toISOString().slice(0, 19)
    .replace(/[-:]/g, "-");
  for (const key in items) {
    const audio = items[key].audio;
    const url = audio.src;
    const a = document.createElement("a");
    a.href = url;
    a.download = `audio-${c}-${nicelyFormattedTimestamp}.wav`;
    a.click();
    c += 1;
  }
}

function ChatTemplate(
  {
    lang,
    parentImages,
    messages,
    readAlways,
    audioFileDict,
    onRefreshAction,
    onSpeakAtGroupIndexAction,
    onImageChange,
    onToggleReadAlwaysAction,
  }: {
    lang: string;
    parentImages: Image[];
    messages: Message[];
    isComplete: boolean;
    readAlways: boolean;
    audioFileDict: AudioFileDict;
    onToggleReadAlwaysAction: () => void;
    onSpeakAtGroupIndexAction: (groupIndex: number) => void;
    onRefreshAction: (groupIndex: number) => void;
    onEditAction: (groupIndex: number) => void;
    onUploadActionToMessages: (uploadedMessages: Message[]) => void;
    onImageChange: (images: Image[]) => void;
    onTrashAction: () => void;
  },
) {
  const [images, setImages] = useState<Image[]>([]);
  const [imageFiles, setImageFiles] = useState<Image[]>([]);

  // deno-lint-ignore no-explicit-any
  const deleteImage = (event: any) => {
    const index = images.findIndex((image) =>
      image.preview === event.target.src
    );
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

  return (
    <div
      class={messages?.length === 0
        ? `bg-transparent`
        : `chat-history flex flex-col space-y-4 p-4 mx-auto rounded-lg shadow bg-white/75`}
    >
      <button
        class={`absolute top-0 left-0 m-4 text-xs align-middle text-gray-600 hover:text-gray-800 transition-colors`}
        onClick={() => onToggleReadAlwaysAction()}
      >
        {readAlways
          ? chatTemplateContent[lang]["readOutText"]
          : chatTemplateContent[lang]["silent"]}
      </button>
      {messages?.map((item, groupIndex) => {
        return (
          <div
            key={groupIndex}
            class={`message-group flex flex-col ${
              item.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <span
              class={`text-sm font-semibold flex justify-center items-center ${
                item.role === "user" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {item.role === "user" ? "Du" : "School Bud-E"}
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
              class={`message mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] ${
                item.role === "user"
                  ? "bg-blue-100 sm:ml-20 md:ml-40"
                  : "bg-gray-100 sm:mr-20 md:mr-40"
              } p-3 rounded-lg ${
                item.role === "user" ? "rounded-tr-none" : "rounded-tl-none"
              } shadow`}
            >
              {typeof item.content === "string"
                ? <span>{item.content}</span>
                : (
                  <span>
                    {typeof item.content[0] === "string"
                      ? item.content.join("")
                      : (
                        <div>
                          {(item.content as unknown as {
                            "type": string;
                            "text": string;
                            "image_url": { url: string };
                          }[]).map((content, contentIndex) => {
                            if (content.type === "text") {
                              return (
                                <span key={contentIndex}>{content.text}</span>
                              );
                            } else if (content.type === "image_url") {
                              return (
                                <img
                                  key={contentIndex}
                                  src={content.image_url.url}
                                  alt="User uploaded image"
                                  class="max-w-full h-auto rounded-lg shadow-sm"
                                />
                              );
                            }
                          })}
                        </div>
                      )}
                  </span>
                )}
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
    </div>
  );
}

export default ChatTemplate;
