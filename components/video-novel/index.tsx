import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../Button.tsx";
import { fullMediaUrl, getVideoNovelStream, initAudioPlayer } from "./store.ts";
import type { VideoNovel } from "../chat/indexedDB.ts";
import { 
  getAllVideoNovels,
  saveVideoNovel,
  deleteVideoNovel
} from "../chat/indexedDB.ts";
import StoryEditor from "../../islands/StoryEditor.tsx";

type ImageSegment = {
  order: number;
  url: string;
  timestamp: number;
  duration: number;
  associatedSegmentId?: string;
};

// Extend HTMLAudioElement to include our custom property
interface CustomAudioElement extends HTMLAudioElement {
  audioPlayer?: ReturnType<typeof initAudioPlayer>;
}

function VideoNovelComponent(_props: { lang: string }) {
  const [status, setStatus] = useState("");
  const [images, setImages] = useState<ImageSegment[]>([]);
  const [currentImage, setCurrentImage] = useState("");
  const [currentAudioOrder, setCurrentAudioOrder] = useState<number | null>(null);
  const [savedNovels, setSavedNovels] = useState<VideoNovel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const audioRef = useRef<CustomAudioElement>(null);

  // Load saved novels on mount
  useEffect(() => {
    const loadNovels = async () => {
      try {
        const novels = await getAllVideoNovels();
        setSavedNovels(novels);
      } catch (err) {
        console.error("Failed to load saved novels:", err);
      }
    };
    loadNovels();
  }, []);

  // Load and play selected novel
  const loadNovel = useCallback(async (id: string) => {
    const novel = savedNovels.find(n => n.id === id);
    if (!novel) return;

    try {
      setStatus("Loading novel...");
      setImages(novel.images);
      setCurrentImage(novel.images[0]?.url || "placeholder.webp");
      
      if (audioRef.current && novel.audioBlob) {
        const blobUrl = URL.createObjectURL(novel.audioBlob);
        audioRef.current.src = blobUrl;
        audioRef.current.load();
        await audioRef.current.play();
      }
    } catch (err) {
      console.error("Failed to load novel:", err);
      setStatus("Error loading novel");
    } finally {
      setStatus("");
    }
  }, [savedNovels]);

  // Handle novel selection change
  useEffect(() => {
    if (selectedNovelId) {
      loadNovel(selectedNovelId);
    }
  }, [selectedNovelId, loadNovel]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const snippetDuration = 5;
    const interval = setInterval(() => {
      const order = Math.floor(audioEl.currentTime / snippetDuration) + 1;
      setCurrentAudioOrder(order);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const progress = currentAudioOrder !== null;
    const firstImageLoaded = images.length > 0;

    if (!progress && firstImageLoaded) {
      const firstImage = images.reduce((prev, curr) =>
        curr.order < prev.order ? curr : prev
      );
      setCurrentImage(firstImage.url);
    } else if (!progress && !firstImageLoaded) {
      setCurrentImage("placeholder.webp");
    } else if (progress && firstImageLoaded && currentAudioOrder !== null) {
      const candidate = images
        .filter((img) => img.order <= currentAudioOrder)
        .sort((a, b) => b.order - a.order)[0];
      setCurrentImage(candidate?.url || "placeholder.webp");
    } else {
      setCurrentImage("placeholder.webp");
    }
  }, [currentAudioOrder, images]);

  const generateVideoNovel = async () => {
    if (!audioRef.current) return;

    try {
      console.log("Starting video novel generation...");
      setStatus("Generating...");
      setImages([]);
      setCurrentImage("");
      setCurrentAudioOrder(null);

      const audioPlayer = initAudioPlayer(audioRef.current);
      console.log("Audio player initialized");
      const stream = await getVideoNovelStream("");
      console.log("Got video novel stream");
      const reader = stream.getReader();
      let isComplete = false;



      while (!isComplete) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream reading complete");
            isComplete = true;
            break;
          }
          if (!value) continue;


          if (value.type === "status") {
            console.log("Status update:", value.data);
            setStatus(value.data);
          } else if (value.type === "videoId") {
            console.log("Video ID received:", value.data);
            setVideoId(value.data);
          } else if (value.type === "complete") {
            console.log("Generation complete");
            setStatus("");
            break;
          } else if (value.type === "file") {
            console.log("Processing file segment:", {
              data: value.data,
              order: value.order,
              type: value.data.endsWith('.mp3') ? 'audio' : 'image'
            });
            
            if (value.data.endsWith(".mp3")) {
              console.log("Processing audio segment:", value.data);
              await audioPlayer.appendSegment(fullMediaUrl(value.data), value.order ?? 0);
            } else {
              const order = value.order ?? 0;
              const imageUrl = fullMediaUrl(value.data);
              console.log("Processing image segment:", { order, imageUrl });
              setImages((prev) => {
                const existing = prev.find((img) => img.order === order);
                const newImages = existing
                  ? prev.map((img) =>
                    img.order === order ? { 
                      order, 
                      url: imageUrl,
                      timestamp: 0,
                      duration: 0,
                      associatedSegmentId: img.associatedSegmentId || order?.toString()
                    } : img
                  )
                  : [...prev, { 
                      order, 
                      url: imageUrl,
                      timestamp: 0,
                      duration: 0,
                      associatedSegmentId: order?.toString()
                    }];
                console.log("Updated images array:", newImages);
                return newImages;
              });
            }
          }
        } catch (error) {
          console.error("Error processing stream segment:", error);
          setStatus(`Error: ${(error as Error).message}`);
        }
      }

      // Store the audio player reference for saving later
      audioRef.current.audioPlayer = audioPlayer;

    } catch (error) {
      console.error("Error in generateVideoNovel:", error);
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const handleEditComplete = async (editHash: string) => {
    setStatus(`Edit completed with hash: ${editHash}`);
    setEditingSegmentId(null);
    // Optionally refresh the novel data here
  };

  return (
    <div class="flex flex-col items-center min-h-screen bg-gray-50">
      <div class="w-full max-w-7xl px-4 py-8">
        <h1 class="text-4xl font-bold text-gray-800 text-center mb-8">
          Interactive Video Novel
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Main Content Area */}
          <div class="space-y-6">
            {/* Square Container for Image */}
            <div class="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={currentImage || "placeholder.webp"}
                alt="Story scene"
                class="w-full h-full object-contain transition-opacity duration-500"
                style={{ opacity: currentImage ? 1 : 0.5 }}
                aria-live="polite"
                aria-label={currentImage ? "Current story scene" : "Loading story scene"}
              />
              {images.length > 0 && currentImage && (
                <button
                  type="button"
                  onClick={() => {
                    const currentSegmentId = images[currentAudioOrder || 0]?.associatedSegmentId;
                    console.log("Current segment ID:", currentSegmentId);
                    if (currentSegmentId) {
                      setEditingSegmentId(currentSegmentId);
                    }
                  }}
                  class="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full shadow-lg hover:bg-amber-50 transition-colors"
                  aria-label="Edit current segment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <title>Edit icon</title>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Edit Dialog */}
            {editingSegmentId && selectedNovelId && (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Edit Segment</h2>
                    <button
                      type="button"
                      onClick={() => setEditingSegmentId(null)}
                      class="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <title>Close dialog</title>
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <StoryEditor
                    originalHash={selectedNovelId}
                    segmentId={editingSegmentId}
                    initialContent=""
                    onEditComplete={handleEditComplete}
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div class="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div class="flex items-center gap-4">
                <Button
                  type="button"
                  onClick={generateVideoNovel}
                  class="h-14 w-14 flex-shrink-0 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-full transition-all duration-200 flex items-center justify-center hover:scale-105 shadow-md hover:shadow-lg"
                  disabled={status.startsWith("Generating")}
                  aria-label={status ? "Generating..." : "Start New Story"}
                >
                  {status ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <title>Loading</title>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <title>Create story icon</title>
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  )}
                </Button>

                {/* Audio Controls */}
                <div class="flex-1 bg-gray-50 rounded-full p-2 shadow-inner">
                  <style>
                    {`
                      audio::-webkit-media-controls-panel {
                        background-color: transparent;
                        padding: 0 8px;
                      }
                      audio::-webkit-media-controls-current-time-display,
                      audio::-webkit-media-controls-time-remaining-display {
                        color: #4B5563;
                        font-size: 14px;
                      }
                      audio::-webkit-media-controls-timeline {
                        height: 4px;
                        margin: 0;
                      }
                      audio::-webkit-media-controls-timeline-container {
                        height: 24px;
                        padding: 10px 0;
                      }
                      /* Hide volume slider but keep mute button */
                      audio::-webkit-media-controls-volume-slider,
                      audio::-webkit-media-controls-volume-slider-container,
                      audio::-webkit-media-controls-volume-control-container {
                        display: none;
                      }
                      audio::-webkit-media-controls-play-button,
                      audio::-webkit-media-controls-mute-button {
                        width: 28px;
                        height: 28px;
                        padding: 2px;
                        opacity: 0.8;
                      }
                      audio::-webkit-media-controls-play-button:hover,
                      audio::-webkit-media-controls-mute-button:hover {
                        opacity: 1;
                      }
                      /* Hide some default controls */
                      audio::-webkit-media-controls-return-to-realtime-button,
                      audio::-webkit-media-controls-rewind-button,
                      audio::-webkit-media-controls-seek-back-button,
                      audio::-webkit-media-controls-seek-forward-button,
                      audio::-webkit-media-controls-fullscreen-button,
                      audio::-webkit-media-controls-toggle-closed-captions-button {
                        display: none;
                      }
                    `}
                  </style>
                  <audio
                    ref={audioRef}
                    controls
                    className="w-full h-10"
                    onPlay={(e: Event) => {
                      if (audioRef.current?.paused) {
                        audioRef.current.play().catch((err) => {
                          setStatus(`Audio playback failed: ${err.message}`);
                          console.error("Audio error:", err);
                        });
                      }
                    }}
                    onError={(e: Event) => {
                      const error = audioRef.current?.error;
                      if (error) {
                        setStatus(`Audio error: ${error.message}`);
                      }
                    }}
                  >
                    <track kind="captions" />
                  </audio>
                </div>
              </div>

              <Button
                type="button"
                onClick={async () => {
                  const name = prompt("Enter a name for this novel:");
                  if (name && audioRef.current) {
                    try {
                      console.log("Starting novel save process...");
                      const audioPlayer = audioRef.current.audioPlayer;
                      
                      if (audioPlayer) {
                        console.log("Getting audio blob from player");
                        const audioBlob = audioPlayer.getAudioBlob();
                        console.log("Audio blob created, size:", audioBlob.size);
                        
                        if (!videoId) {
                          console.error("Video ID not available");
                          setStatus("Error: Video ID not generated yet");
                          return;
                        }
                        const novelData = {
                          id: videoId,
                          name,
                          images: images.sort((a, b) => a.order - b.order),
                          audioBlob,
                          segments: []
                        };
                        
                        await saveVideoNovel(novelData);
                        const updatedNovels = await getAllVideoNovels();
                        setSavedNovels(updatedNovels);
                      } else {
                        console.warn("No audio player found");
                        setStatus("Error: No audio content to save");
                      }
                    } catch (error) {
                      console.error("Error saving novel:", error);
                      setStatus(`Error saving: ${(error as Error).message}`);
                    }
                  }
                }}
                class="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <title>Save story icon</title>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Story
              </Button>
            </div>

            {status.startsWith("Error") && (
              <div 
                class="text-red-600 bg-red-100 p-4 rounded-lg"
                role="alert"
                aria-live="assertive"
              >
                <p class="font-medium">{status}</p>
                <button type="button" onClick={generateVideoNovel} class="text-red-700 underline mt-2">
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Gallery Section */}
          <div class="space-y-6">
            {savedNovels.length > 0 && (
              <>
                <h2 class="text-2xl font-semibold text-gray-800">Your Stories</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedNovels.map((novel) => (
                    <div
                      key={novel.id}
                      class={`group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                        selectedNovelId === novel.id ? 'ring-2 ring-amber-500' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedNovelId(novel.id)}
                        class="w-full text-left"
                      >
                        <div class="aspect-square relative">
                          <img
                            src={novel.images[0]?.url || "placeholder.webp"}
                            alt={`Cover for ${novel.name}`}
                            class="w-full h-full object-contain bg-gray-50"
                          />
                          {selectedNovelId === novel.id && (
                            <div class="absolute inset-0 bg-amber-500 bg-opacity-10" />
                          )}
                        </div>
                        <div class="p-4">
                          <h3 class="font-medium text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                            {novel.name}
                          </h3>
                          <p class="text-sm text-gray-500 mt-1">
                            {novel.images.length} scenes
                          </p>
                        </div>
                      </button>
                      {selectedNovelId === novel.id && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this story?')) {
                              await deleteVideoNovel(novel.id);
                              setSavedNovels(await getAllVideoNovels());
                              setSelectedNovelId(null);
                            }
                          }}
                          class="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors group/delete"
                          aria-label={`Delete ${novel.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 group-hover/delete:text-red-500" aria-hidden="true">
                            <title>Delete story icon</title>
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoNovelComponent;