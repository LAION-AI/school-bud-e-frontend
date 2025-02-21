import { 
  getAllVideoNovels,
  saveVideoNovel,
  deleteVideoNovel,
  initDB
} from "./indexedDB.ts";
import { describe, it, expect, beforeEach } from "vitest";

describe("IndexedDB operations", () => {
  beforeEach(async () => {
    // Reset database before each test
    await initDB();
  });

  it("should initialize database with videoNovels store", async () => {
    const db = await initDB();
    expect(db.objectStoreNames.contains("videoNovels")).toBe(true);
  });

  it("should save and retrieve a video novel", async () => {
    const novel = {
      id: "test-id",
      name: "Test Novel",
      images: [],
      audioSrc: "test.mp3",
      segments: []
    };

    await saveVideoNovel(novel);
    const novels = await getAllVideoNovels();
    
    expect(novels).toHaveLength(1);
    expect(novels[0]).toMatchObject(novel);
  });

  it("should delete a video novel", async () => {
    const novel = {
      id: "test-id",
      name: "Test Novel",
      images: [],
      audioSrc: "test.mp3",
      segments: []
    };

    await saveVideoNovel(novel);
    await deleteVideoNovel(novel.id);
    const novels = await getAllVideoNovels();
    
    expect(novels).toHaveLength(0);
  });
});
