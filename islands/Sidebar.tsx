import { useEffect, useState } from "preact/hooks";
import Settings from "../components/Settings.tsx";
import { chats, deleteChat } from "../components/chat/store.ts";

interface SidebarProps {
  currentChatSuffix: string;
  onChatSelect: (suffix: string) => void;
  onNewChat: () => void;
  onDeleteAllChats: () => void;
  onDownloadChat: () => void;
  lang?: string;
}

export default function Sidebar({
  currentChatSuffix,
  onChatSelect,
  onNewChat,
  onDeleteAllChats,
  lang = "en",
  onDownloadChat,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const urlParams = new URLSearchParams(location.search);
    const collapsed = urlParams.get("collapsed");
    console.log(location.search)
    return collapsed === "true";
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(location.search);
      urlParams.set("collapsed", "" + isCollapsed)
      const newUrl = `${location.origin}${location.pathname}?${urlParams.toString()}`;
      history.replaceState(null, "", newUrl);
    }
  }, [isCollapsed]);

  return (
    <>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        class="absolute left-4 top-16 z-10 p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div class={`sidebar bg-savanna rounded-lg shadow-lg h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>

        <div class="p-4 flex-1 overflow-y-auto mt-12">
          <button
            onClick={onNewChat}
            class={`w-full border p-2 rounded mb-4 flex items-center justify-center ${isCollapsed ? 'px-2' : 'px-4'}`}
          >
            {isCollapsed ? '+' : 'New Chat'}
          </button>
          <div class="space-y-2">
            {Object.keys(chats.value).sort().map((key) => {
              const suffix = key.slice(10);
              return (
                <div class={`flex items-center rounded-md group border ${suffix === currentChatSuffix ? '' : 'border-transparent '}`}>

                  <button
                    key={suffix}
                    onClick={() => onChatSelect(suffix)}
                    class={`sidebar-button w-full px-3 py-2 text-left truncate`}
                  >
                    {isCollapsed ? `#${parseInt(suffix) + 1}` : `Chat ${parseInt(suffix) + 1}`}
                  </button>
                  <button type="button" onClick={() => deleteChat(suffix)} class="group-hover:text-gray-400 text-transparent">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
                      <path d="M18 6l-12 12"></path>
                      <path d="M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div class="p-4 border-t space-y-2">
          <button
            onClick={onDeleteAllChats}
            class="w-full text-white p-2 rounded hover:bg-red-700 bg-red-600 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class={`h-5 w-5 ${isCollapsed ? '' : 'mr-2'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {!isCollapsed && 'Delete All'}
          </button>
          <button
            onClick={onDownloadChat}
            class="w-full text-white p-2 rounded hover:bg-green-700 bg-green-600 flex items-center justify-center"
          >
            {!isCollapsed && 'Download Chat'}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            class="w-full rounded flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={`${isCollapsed ? '' : 'mr-2'}`}>
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
              <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            </svg>
            {!isCollapsed && 'Settings'}
          </button>
        </div>
      </div >
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          lang={lang}
        />
      )
      }
    </>
  );
}