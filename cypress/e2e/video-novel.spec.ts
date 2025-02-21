import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { videoNovelStore } from "../../components/video-novel/store.ts";

Deno.test("Video Novel Store - Save and Load", async () => {
  const store = videoNovelStore;
  const testNovel = {
    id: "test-id",
    name: "Test Novel",
    content: "Test content",
    audioBlob: new Blob(),
    createdAt: Date.now(),
    images: [],
    segments: []
  };

  // Test saving
  await store.saveNovel(testNovel);
  const savedNovel = await store.getNovel("test-id");
  assertEquals(savedNovel?.name, "Test Novel");

  // Test loading list
  const novels = await store.getNovels();
  assertEquals(novels.length, 1);
  assertEquals(novels[0].name, "Test Novel");

  // Test deletion
  await store.deleteNovel("test-id");
  const deletedNovel = await store.getNovel("test-id");
  assertEquals(deletedNovel, null);
});
