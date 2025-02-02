import { chatTemplateContent } from "../internalization/content.ts";

interface ChatControlsProps {
  readAlways: boolean;
  autoScroll: boolean;
  onToggleReadAlwaysAction: () => void;
  onToggleAutoScrollAction: () => void;
  lang: string;
}

export function ChatControls({
  readAlways,
  autoScroll,
  onToggleReadAlwaysAction,
  onToggleAutoScrollAction,
  lang,
}: ChatControlsProps) {
  return (
    <div class="flex space-x-4">
      <button
        class="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all backdrop-blur-sm bg-gray-800/30"
        onClick={onToggleReadAlwaysAction}
        title={readAlways ? chatTemplateContent[lang]["readOutText"] : chatTemplateContent[lang]["silent"]}
      >
        {readAlways ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6L8 10H4V14H8L12 18V6Z" />
            <path d="M17 7C17 7 19 9 19 12C19 15 17 17 17 17" />
            <path d="M15.5 10.5C15.5 10.5 16 11.2 16 12C16 12.8 15.5 13.5 15.5 13.5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6L8 10H4V14H8L12 18V6Z" />
            <line x1="17" y1="7" x2="17" y2="17" />
            <line x1="12" y1="12" x2="22" y2="12" />
          </svg>
        )}
      </button>
      <button
        class="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all backdrop-blur-sm bg-gray-800/30"
        onClick={onToggleAutoScrollAction}
        title={autoScroll ? chatTemplateContent[lang]["autoScrollOn"] : chatTemplateContent[lang]["autoScrollOff"]}
      >
        {autoScroll ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3V21" />
            <polyline points="19 14 12 21 5 14" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3V16" />
            <polyline points="19 9 12 16 5 9" />
          </svg>
        )}
      </button>
    </div>
  );
}