import { settings } from "../chat/store.ts";
import type { 
  VideoNovel,
  Segment as DBSegment
} from "../chat/indexedDB.ts";
import { 
  initDB, 
  saveVideoNovel, 
  getAllVideoNovels,
  getVideoNovel,
  updateVideoNovel,
  deleteVideoNovel,
  getVideoNovelSegments,
  saveVideoNovelSegment
} from "../chat/indexedDB.ts";

const AI_TASKS_SERVER_URL = "http://localhost:8083";

class VideoNovelStore {
  private novels: VideoNovel[] = [];
  private currentNovel: VideoNovel | null = null;
  
  constructor() {
    this.loadNovels();
  }

  async loadNovels(): Promise<void> {
    try {
      this.novels = await getAllVideoNovels();
    } catch (err) {
      console.error("Failed to load video novels:", err);
    }
  }

  async saveNovel(novel: VideoNovel): Promise<void> {
    try {
      await saveVideoNovel(novel);
      await this.loadNovels(); // Refresh list
    } catch (err) {
      console.error("Failed to save video novel:", err);
      throw err;
    }
  }

  async getNovel(id: string): Promise<VideoNovel> {
    try {
      const novel = await getVideoNovel(id);
      this.currentNovel = novel;
      return novel;
    } catch (err) {
      console.error("Failed to get video novel:", err);
      throw err;
    }
  }

  async updateNovel(id: string, updates: Partial<VideoNovel>): Promise<void> {
    try {
      await updateVideoNovel(id, updates);
      await this.loadNovels(); // Refresh list
    } catch (err) {
      console.error("Failed to update video novel:", err);
      throw err;
    }
  }

  async deleteNovel(id: string): Promise<void> {
    try {
      await deleteVideoNovel(id);
      await this.loadNovels(); // Refresh list
    } catch (err) {
      console.error("Failed to delete video novel:", err);
      throw err;
    }
  }

  async getSegments(novelId: string): Promise<DBSegment[]> {
    try {
      return await getVideoNovelSegments(novelId);
    } catch (err) {
      console.error("Failed to get segments:", err);
      throw err;
    }
  }

  async saveSegment(segment: DBSegment): Promise<void> {
    try {
      await saveVideoNovelSegment(segment);
    } catch (err) {
      console.error("Failed to save segment:", err);
      throw err;
    }
  }

  getNovels(): VideoNovel[] {
    return this.novels;
  }

  getCurrentNovel(): VideoNovel | null {
    return this.currentNovel;
  }
}

// Initialize IndexedDB when store is created
initDB().catch((err: Error) => {
  console.error("Failed to initialize IndexedDB:", err);
});

export const videoNovelStore = new VideoNovelStore();

type AudioSegment = {
  type: "file";
  data: string;
  order: number;
};

type StatusSegment = {
  type: "status";
  data: string;
  order: number;
};

type CompleteSegment = {
  type: "complete";
  data: string;
};

type StreamSegment = AudioSegment | StatusSegment | CompleteSegment;

export async function getVideoNovelStream(
  prompt: string,
): Promise<ReadableStream<StreamSegment>> {
  const fetchOptions: RequestInit = {
    method: "POST",
    body: JSON.stringify({
      stream: true,
      prompt,
      llmKey: settings.peek().apiKey,
    }),
  };

  const response = await fetch(
    `${AI_TASKS_SERVER_URL}/generate_video/`,
    fetchOptions,
  );
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Send completion signal
            console.log("Stream complete - sending completion signal");
            await controller.enqueue({ type: "complete", data: "Generation complete" });
            await controller.close();
            console.log("Stream controller closed");
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const data = JSON.parse(line);
            controller.enqueue(data);
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel(err) {
      console.log("Stream cancelled", err);
    },
  });
}

export function fullMediaUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }
  return AI_TASKS_SERVER_URL + path;
}

export function initAudioPlayer(audio: HTMLMediaElement) {
  console.log("Initializing audio player");
  const mediaSource = new MediaSource();
  audio.src = URL.createObjectURL(mediaSource);
  let sourceBuffer: SourceBuffer;
  const queue: { url: string; order: number; data?: ArrayBuffer }[] = [];
  let isSourceOpen = false;
  const audioSegments: { buffer: ArrayBuffer; order: number }[] = [];
  let currentSegmentIndex = 0;

  mediaSource.addEventListener("sourceopen", () => {
    console.log("MediaSource opened");
    sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
    sourceBuffer.mode = "sequence";
    isSourceOpen = true;

    // Process queued segments in order
    if (queue.length > 0) {
      console.log("Processing queued segments:", queue.length);
      // Sort queue by order before processing
      queue.sort((a, b) => a.order - b.order);
      processQueue();
    }
  });

  async function processQueue() {
    while (queue.length > 0) {
      const segment = queue[0];
      console.log("Processing audio segment:", { order: segment.order, url: segment.url });
      try {
        let arrayBuffer: ArrayBuffer;
        if (segment.data) {
          arrayBuffer = segment.data;
        } else {
          const response = await fetch(segment.url);
          arrayBuffer = await response.arrayBuffer();
          segment.data = arrayBuffer;
        }
        sourceBuffer.appendBuffer(arrayBuffer);
        audioSegments.push({ buffer: arrayBuffer, order: segment.order });
        console.log(`Audio segment ${segment.order} processed and added to buffer`);
        queue.shift(); // Remove processed segment
      } catch (error) {
        console.error("Error processing audio segment:", error);
        break;
      }
    }
  }

  sourceBuffer?.addEventListener("updateend", () => {
    console.log("SourceBuffer update ended, processing next segment");
    processQueue();
  });

  // Add timeupdate listener to track current segment
  audio.addEventListener("timeupdate", () => {
    const currentTime = audio.currentTime;
    const segmentDuration = 5; // Assuming each segment is 5 seconds
    const estimatedSegment = Math.floor(currentTime / segmentDuration);
    
    if (estimatedSegment !== currentSegmentIndex) {
      currentSegmentIndex = estimatedSegment;
      console.log(`Now playing segment with index: ${currentSegmentIndex}, time: ${currentTime.toFixed(2)}s`);
      
      // Find the actual segment by order
      const currentSegment = audioSegments[currentSegmentIndex];
      if (currentSegment) {
        console.log(`Current audio segment order: ${currentSegment.order}`);
      }
    }
  });

  const player = {
    async appendSegment(url: string, order: number) {
      console.log("Received audio segment:", { url, order });
      if (!isSourceOpen) {
        console.log("MediaSource not open, queueing segment");
        queue.push({ url, order });
        return;
      }

      if (sourceBuffer?.updating) {
        console.log("SourceBuffer updating, queueing segment");
        queue.push({ url, order });
        return;
      }

      try {
        console.log("Fetching audio segment:", url);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        sourceBuffer?.appendBuffer(arrayBuffer);
        audioSegments.push({ buffer: arrayBuffer, order });
        console.log(`Audio segment ${order} appended to buffer`);
      } catch (error) {
        console.error("Error fetching/appending segment:", error);
      }
    },
    getAudioBlob() {
      console.log("Creating audio blob from segments:", audioSegments.length);
      // Sort segments by order before creating blob
      const sortedSegments = [...audioSegments].sort((a, b) => a.order - b.order);
      console.log("Segment orders:", sortedSegments.map(s => s.order));
      return new Blob(sortedSegments.map(s => s.buffer), { type: "audio/mpeg" });
    }
  };

  return player;
}
