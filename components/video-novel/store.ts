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
import { IS_BROWSER } from "$fresh/runtime.ts";

const AI_TASKS_SERVER_URL = "http://localhost:8083";

class VideoNovelStore {
  private novels: VideoNovel[] = [];
  private currentNovel: VideoNovel | null = null;
  
  constructor() {
    if (IS_BROWSER) {
      this.loadNovels();
    }
  }

  async loadNovels(): Promise<void> {
    if (!IS_BROWSER) return;
    
    try {
      this.novels = await getAllVideoNovels();
    } catch (err) {
      console.error("Failed to load video novels:", err);
    }
  }

  async saveNovel(novel: VideoNovel): Promise<void> {
    if (!IS_BROWSER) return;
    
    try {
      await saveVideoNovel(novel);
      await this.loadNovels(); // Refresh list
    } catch (err) {
      console.error("Failed to save video novel:", err);
      throw err;
    }
  }

  async getNovel(id: string): Promise<VideoNovel> {
    if (!IS_BROWSER) throw new Error("Cannot get novel on server");
    
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
    if (!IS_BROWSER) return;
    
    try {
      await updateVideoNovel(id, updates);
      await this.loadNovels(); // Refresh list
    } catch (err) {
      console.error("Failed to update video novel:", err);
      throw err;
    }
  }

  async deleteNovel(id: string): Promise<void> {
    if (!IS_BROWSER) return;
    
    try {
      await deleteVideoNovel(id);
      await this.loadNovels(); // Refresh list
    } catch (err) {
      console.error("Failed to delete video novel:", err);
      throw err;
    }
  }

  async getSegments(novelId: string): Promise<DBSegment[]> {
    if (!IS_BROWSER) return [];
    
    try {
      return await getVideoNovelSegments(novelId);
    } catch (err) {
      console.error("Failed to get segments:", err);
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

export function fullMediaUrl(path: string): string {
  return path.startsWith("http") ? path : `${AI_TASKS_SERVER_URL}${path}`;
}

export async function getVideoNovelStream(prompt: string): Promise<ReadableStream<StreamSegment>> {
  const response = await fetch(`${AI_TASKS_SERVER_URL}/generate_video/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate video novel");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = new TextDecoder().decode(value).split("\n");
          for (const line of lines) {
            if (!line.trim()) continue;
            const data = JSON.parse(line);
            controller.enqueue(data);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export function initAudioPlayer(audio: HTMLAudioElement) {
  console.log("Initializing audio player");

  const player = {
    segments: [] as { url: string; order: number }[],
    currentSegment: 0,
    audioBlob: new Blob([], { type: "audio/mpeg" }),

    async appendSegment(url: string, order: number) {
      console.log("Appending segment:", { url, order });
      this.segments.push({ url, order });
      this.segments.sort((a, b) => a.order - b.order);

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        this.audioBlob = new Blob([this.audioBlob, blob], {
          type: "audio/mpeg",
        });

        // Update audio source
        const blobUrl = URL.createObjectURL(this.audioBlob);
        audio.src = blobUrl;

        // If this is the first segment, start playing
        if (this.segments.length === 1) {
          try {
            await audio.play();
          } catch (error) {
            console.error("Error playing audio:", error);
          }
        }
      } catch (error) {
        console.error("Error appending segment:", error);
      }
    },

    getAudioBlob() {
      return this.audioBlob;
    },
  };

  return player;
}
