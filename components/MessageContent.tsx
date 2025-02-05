import { renderTextWithLinksAndBold } from "../utils/textUtils.tsx";
import { GraphLoadingState } from "./GraphLoadingState.tsx";

// Define supported content types
type ContentType = "text" | "image_url";
type JsonBlockType = "graphjson" | "webresultjson" | "gamejson";
type BlockStatus = "loading" | "completed";

// Base content segment interface
interface BaseSegment {
  type: ContentType | JsonBlockType;
}

// Text segment interface
interface TextSegment extends BaseSegment {
  type: "text";
  content: string;
}

// JSON block segment interface
interface JsonBlockSegment extends BaseSegment {
  type: JsonBlockType;
  status: BlockStatus;
  code?: string; // Optional code field for gamejson
}

// Combined type for all possible segments
type GraphSegment = TextSegment | JsonBlockSegment;

// Props interface for the component
interface MessageContentProps {
  content: Message["content"];
}

// Content item interface for structured content
interface ContentItem {
  type: ContentType;
  text?: string;
  image_url?: { url: string };
}


/**
 * Processes a string looking for a graph JSON block.
 * The returned segments will be:
 * - Plain text (with webresults blocks removed)
 * - A graph segment (with status "loading" if the closing marker hasn't been received,
 *   or "completed" if it has)
 * - (If complete) any text after the graph block.
 */
function processGraphJsonSegments(types: ('graphjson' | 'webresultjson' | 'gamejson')[], text: string): GraphSegment[] {
  const segments: GraphSegment[] = [];
  let currentPosition = 0;

  while (currentPosition < text.length) {
    let earliestIndex = -1;
    let matchedType: ('graphjson' | 'webresultjson' | 'gamejson') | null = null;

    // Find the earliest occurrence of any type's opening marker
    for (const type of types) {
      const openMarker = "```" + type;
      const index = text.indexOf(openMarker, currentPosition);
      if (index !== -1 && (earliestIndex === -1 || index < earliestIndex)) {
        earliestIndex = index;
        matchedType = type;
      }
    }

    if (earliestIndex === -1) {
      // No more blocks found, add remaining text
      segments.push({ type: "text", content: text.substring(currentPosition) });
      break;
    }

    // Add text before the block
    if (earliestIndex > currentPosition) {
      segments.push({
        type: "text",
        content: text.substring(currentPosition, earliestIndex)
      });
    }

    const openMarker = "```" + matchedType;
    const closeMarker = "end" + matchedType + "```";
    const closeIndex = text.indexOf(closeMarker, earliestIndex + openMarker.length);


    if (closeIndex === -1) {
      // Incomplete block: mark as loading
      segments.push({ type: matchedType, status: "loading" });
      break; // Stop processing as we hide everything after
    } else {
      if (matchedType === "gamejson") {
        const code = text.substring(earliestIndex + openMarker.length, closeIndex);

        segments.push({ type: "gamejson", status: "completed", code });
        currentPosition = closeIndex + closeMarker.length;
      } else {

        // Complete block: mark as completed
        segments.push({ type: matchedType, status: "completed" });
        currentPosition = closeIndex + closeMarker.length;
      }
    }
  }

  return segments;
}

export function MessageContent({ content }: MessageContentProps) {
  // For streaming, we assume the message content is being updated over time.
  // We want to process the content so that:
  // - If a graph marker is present without a closing marker,
  //   everything from the opening marker onward is hidden and a loading indicator is shown.
  // - If the graph block is complete, the placeholder shows the completed state.
  // - Webresults blocks are always hidden.
  //
  // We handle two types of content:
  // 1. A string or an array of strings (which we join together)
  // 2. An array of objects (with type "text" or "image_url")

  if (typeof content === "string" || (Array.isArray(content) && typeof content[0] === "string")) {
    // If content is a single string or an array of strings, join them.
    const fullText = typeof content === "string" ? content : content.join("");
    const segments = processGraphJsonSegments(["graphjson", "webresultjson", "gamejson"], fullText);

    return (
      <span>
        {segments.map((seg, idx) => {
          if (seg.type === "text") {
            return (
              <span key={idx}>
                {renderTextWithLinksAndBold(seg.content)}
              </span>
            );
          } else if (seg.type === "graphjson" || seg.type === "webresultjson" || seg.type === "gamejson") {
            return (
              <GraphLoadingState
                key={idx}
                type={seg.type}
                isLoading={seg.status === "loading"}
                isComplete={seg.status === "completed"}
              />
            );
          }
          return null;
        })}
      </span>
    );
  }

  // Otherwise, assume content is an array of objects.
  return (
    <span>
      <div>
        {(content as {
          type: string;
          text: string;
          image_url: { url: string };
        }[]).map((item, contentIndex) => {
          if (item.type === "text") {
            const segments = processGraphJsonSegments(['graphjson', 'webresultjson', 'gamejson'], item.text);
            return (
              <span key={contentIndex}>
                {segments.map((seg, idx) => {
                  if (seg.type === "text") {
                    return (
                      <span key={idx}>
                        {renderTextWithLinksAndBold(seg.content)}
                      </span>
                    );
                  } else if (["graphjson", "webresultjson", "gamejson"].includes(seg.type)) {
                    return (
                      <GraphLoadingState
                        key={idx}
                        isLoading={seg.status === "loading"}
                        isComplete={seg.status === "completed"}
                        type={seg.type}
                      />
                    );
                  } return null;
                })}
              </span>
            );
          } else if (item.type === "image_url") {
            return (
              <img
                key={contentIndex}
                src={item.image_url.url}
                alt="User uploaded image"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            );
          }
          return null;
        })}
      </div>
    </span>
  );
}
