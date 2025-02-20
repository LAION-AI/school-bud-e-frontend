import { settings } from "../chat/store.ts";

const AI_TASKS_SERVER_URL = "http://localhost:8083";

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

type Segment = AudioSegment | StatusSegment;

export async function getVideoNovelStream(
	prompt: string,
): Promise<ReadableStream<Segment>> {
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
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";
					for (const line of lines) {
						const data = JSON.parse(line);
						controller.enqueue(data);
					}
				}
				controller.close();
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

export function initAudioPlayer(audio: HTMLVideoElement) {
	const mediaSource = new MediaSource();
	audio.src = URL.createObjectURL(mediaSource);
	let sourceBuffer: SourceBuffer;
	const queue: string[] = [];
	let isSourceOpen = false;

	mediaSource.addEventListener("sourceopen", () => {
		sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
		sourceBuffer.mode = "sequence"; // Ensure segments are played in sequence
		isSourceOpen = true;

		// Process any queued segments
		while (queue.length > 0) {
			const url = queue.shift();
			if (url) fetchAndAppendSegment(url);
		}
	});

	async function fetchAndAppendSegment(url: string) {
		if (!isSourceOpen) {
			queue.push(url);
			return;
		}

		try {
			const response = await fetch(url);
			const arrayBuffer = await response.arrayBuffer();
			sourceBuffer.appendBuffer(arrayBuffer);
		} catch (error) {
			console.error("Error fetching or appending segment:", error);
		}
	}

	return fetchAndAppendSegment;
}
