import { useRef, useState, useEffect } from "preact/hooks";
import { Button } from "../Button.tsx";
import { fullMediaUrl, getVideoNovelStream, initAudioPlayer } from "./store.ts";

type ImageSegment = {
  order: number;
  url: string;
};

function VideoNovelComponent(_props: { lang: string }) {
  const [status, setStatus] = useState("");
  // Store image segments that come in with an order.
  const [images, setImages] = useState<ImageSegment[]>([]);
  // The URL of the image currently shown.
  const [currentImage, setCurrentImage] = useState("");
  // The current audio progress order, derived from the audio element's currentTime.
  const [currentAudioOrder, setCurrentAudioOrder] = useState<number | null>(null);

  // Use a single audio element (ref) for playback and progress tracking.
  const audioRef = useRef<HTMLAudioElement>(null);

  // Poll the audio element's currentTime to compute the current order.
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const snippetDuration = 5; // Each audio snippet is 5 seconds.
    const interval = setInterval(() => {
      // Compute order as 1-indexed: e.g. at 8 sec, order = Math.floor(8/5)+1 = 2.
      const order = Math.floor(audioEl.currentTime / snippetDuration) + 1;
      setCurrentAudioOrder(order);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Decide which image to show based on audio progress and loaded images.
  useEffect(() => {
    const progress = currentAudioOrder !== null;
    const firstImageLoaded = images.length > 0;

    if (!progress && firstImageLoaded) {
      // NO_PROGRESS && FIRST_IMAGE_LOADED: show the image with the lowest order.
      const firstImage = images.reduce((prev, curr) =>
        curr.order < prev.order ? curr : prev
      );
      setCurrentImage(firstImage.url);
    } else if (!progress && !firstImageLoaded) {
      // NO_PROGRESS && no images: show a placeholder.
      setCurrentImage("placeholder.webp");
    } else if (progress && firstImageLoaded && currentAudioOrder !== null) {
      // PROGRESS && FIRST_IMAGE_LOADED:
      // Find the image with the highest order that's <= currentAudioOrder.
      const candidate = images
        .filter((img) => img.order <= currentAudioOrder)
        .sort((a, b) => b.order - a.order)[0];
      if (candidate) {
        setCurrentImage(candidate.url);
      } else {
        setCurrentImage("placeholder.webp");
      }
    } else {
      setCurrentImage("placeholder.webp");
    }
  }, [currentAudioOrder, images]);

  const generateVideoNovel = async () => {
    if (!audioRef.current) return;
    try {
      setStatus("Generating...");
      setImages([]);
      setCurrentImage("");
      setCurrentAudioOrder(null);

      // Initialize the audio player; this sets up a MediaSource on the audio element.
      const fetchAndAppendSegment = initAudioPlayer(audioRef.current);
      const stream = await getVideoNovelStream("");
      const reader = stream.getReader();
      console.log(stream);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        if (value.type === "status") {
          setStatus(value.data);
          // Optionally, update progress info from status if available.
        } else if (value.type === "file") {
          if (value.data.endsWith(".mp3")) {
            // Audio segment: fetch and append to the MediaSource.
            console.log(value.data);
            fetchAndAppendSegment(fullMediaUrl(value.data));
          } else {
            debugger;
            // Image segment: store it with its order (defaulting to 0 if not provided).
            const order = value.order ?? 0;
            const imageUrl = fullMediaUrl(value.data);
            setImages((prev) => {
              const existing = prev.find((img) => img.order === order);
              if (existing) {
                return prev.map((img) =>
                  img.order === order ? { order, url: imageUrl } : img
                );
              } else {
                return [...prev, { order, url: imageUrl }];
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error generating video novel:", error);
      setStatus("Error: Failed to generate video novel");
    }
  };

  return (
    <div>
      <h1>Video Novel Generator</h1>
      <Button type="button" onClick={generateVideoNovel}>
        Generate now
      </Button>
      <audio ref={audioRef} controls autoPlay />
      {/* The img element displays the current image */}
      <img
        src={currentImage || "placeholder.webp"}
        alt="Slideshow"
        width={640}
        height={360}
      />
    </div>
  );
}

export default VideoNovelComponent;
