import { renderTextWithLinksAndBold } from "../utils/textUtils.tsx";

interface MessageContentProps {
  content: Message["content"];
}

export function MessageContent({ content }: MessageContentProps) {
  if (typeof content === "string") {
    return <span>{renderTextWithLinksAndBold(content)}</span>;
  }

  return (
    <span>
      {typeof content[0] === "string" ? (
        renderTextWithLinksAndBold(content.join(""))
      ) : (
        <div>
          {(content as unknown as {
            type: string;
            text: string;
            image_url: { url: string };
          }[]).map((item, contentIndex) => {
            if (item.type === "text") {
              return (
                <span key={contentIndex}>
                  {renderTextWithLinksAndBold(item.text)}
                </span>
              );
            } else if (item.type === "image_url") {
              return (
                <img
                  key={contentIndex}
                  src={item.image_url.url}
                  alt="User uploaded image"
                  class="max-w-full h-auto rounded-lg shadow-sm"
                />
              );
            }
          })}
        </div>
      )}
    </span>
  );
}