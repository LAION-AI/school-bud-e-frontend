import { assertEquals, assertExists } from "https://deno.land/std@0.210.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.210.0/async/mod.ts";
import type { EditSession, VideoNovelSegment } from "../types/formats.ts";

// Mock fetch for testing
const originalFetch = globalThis.fetch;
let mockResponses: Map<string, Response> = new Map();

function setupMockFetch() {
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const url = input instanceof URL ? input.toString() : input.toString();
    const mockResponse = mockResponses.get(url);
    if (mockResponse) {
      return mockResponse;
    }
    return new Response(null, { status: 404 });
  };
}

function resetMockFetch() {
  globalThis.fetch = originalFetch;
  mockResponses = new Map();
}

function mockResponse(url: string, data: unknown, status = 200) {
  mockResponses.set(url, new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  }));
}

interface EditResponseData {
  edit_hash: string;
}

interface EditStatusData {
  status: EditSession["status"];
  error?: string;
}

Deno.test("Story Edit Feature", async (t) => {
  await t.step("should allow editing a story segment", async () => {
    const editHash = "test-edit-hash";
    const originalSegment: VideoNovelSegment = {
      id: "1",
      type: "text",
      content: "Original content",
      speaker: "STORYTELLER",
      order: 1,
    };

    const editedContent = "Once upon a time in a magical forest";
    
    // Mock API responses
    mockResponse("/edit_story/original-hash", { edit_hash: editHash });
    mockResponse(`/edit_status/${editHash}`, { 
      status: "completed",
      originalHash: "original-hash",
      editHash,
      createdAt: new Date().toISOString(),
    });

    // Simulate edit request
    const editResponse = await fetch("/edit_story/original-hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segment_id: "1",
        edit_content: editedContent,
      }),
    });

    assertEquals(editResponse.status, 200);
    const editData = await editResponse.json() as EditResponseData;
    assertExists(editData.edit_hash);

    // Poll for edit status
    let attempts = 0;
    const maxAttempts = 5;
    let finalStatus = 0;

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`/edit_status/${editData.edit_hash}`);
      finalStatus = statusResponse.status;
      const status = await statusResponse.json() as EditStatusData;
      
      if (status.status === "completed") {
        break;
      }
      
      if (status.status === "failed") {
        throw new Error(`Edit failed: ${status.error}`);
      }
      
      await delay(1000);
      attempts++;
    }

    assertEquals(finalStatus, 200);
  });

  await t.step("should validate edit continuity", async () => {
    const invalidEdit = {
      segment_id: "1",
      edit_content: '<segment id="1" type="text" speaker="INVALID">Breaking continuity</segment>',
    };

    const response = await fetch("/edit_story/original-hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidEdit),
    });

    assertEquals(response.status, 400);
    const data = await response.json() as { detail: string };
    assertEquals(data.detail, "Invalid edit - breaks story continuity");
  });

  await t.step("should handle concurrent edits", async () => {
    const editRequests = Array(3).fill(null).map((_, i) => ({
      segment_id: "1",
      edit_content: `Edit session ${i + 1}`,
    }));

    const responses = await Promise.all(
      editRequests.map(req =>
        fetch("/edit_story/original-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        })
      )
    );

    // Each request should succeed and get a unique edit hash
    const editHashes = new Set<string>();
    for (const response of responses) {
      assertEquals(response.status, 200);
      const data = await response.json() as EditResponseData;
      editHashes.add(data.edit_hash);
    }

    // Verify each edit got a unique hash
    assertEquals(editHashes.size, editRequests.length);
  });
});

// Setup and cleanup
Deno.test({
  name: "Story Edit Feature Setup",
  fn: () => {
    setupMockFetch();
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Story Edit Feature Cleanup",
  fn: () => {
    resetMockFetch();
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
