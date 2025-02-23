import { signal } from "@preact/signals";

const AI_TASKS_SERVER_URL = "http://localhost:8083";

interface EditSession {
  editHash: string;
  status: string;
  error?: string;
}

class EditStore {
  private editSession = signal<EditSession | null>(null);

  async editStorySegment(originalHash: string, segmentId: string, editContent: string): Promise<void> {
    try {
      const response = await fetch(`${AI_TASKS_SERVER_URL}/edit_story/${originalHash}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segment_id: segmentId,
          edit_content: editContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to edit story');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Parse the chunks (each line is a JSON object)
        const lines = new TextDecoder().decode(value).split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const data = JSON.parse(line);
          
          if (data.type === 'status') {
            this.editSession.value = {
              editHash: data.editHash,
              status: data.data,
            };
          } else if (data.type === 'error') {
            this.editSession.value = {
              editHash: data.editHash,
              status: 'error',
              error: data.data,
            };
          }
        }
      }
    } catch (error) {
      console.error('Error editing story:', error);
      this.editSession.value = {
        editHash: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async checkEditStatus(editHash: string): Promise<void> {
    try {
      const response = await fetch(`${AI_TASKS_SERVER_URL}/edit_status/${editHash}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to check edit status');
      }

      const status = await response.json();
      this.editSession.value = {
        editHash,
        status: status.status,
        error: status.error,
      };
    } catch (error) {
      console.error('Error checking edit status:', error);
      this.editSession.value = {
        editHash,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  getEditSession(): EditSession | null {
    return this.editSession.value;
  }
}

export const editStore = new EditStore(); 