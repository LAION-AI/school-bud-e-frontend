import { useState } from "preact/hooks";
import Settings from "../components/Settings.tsx";

interface SidebarProps {
  localStorageKeys: string[];
  currentChatSuffix: string;
  onChatSelect: (suffix: string) => void;
  onNewChat: () => void;
  onDeleteAllChats: () => void;
  settings: {
    universalApiKey: string;
    apiUrl: string;
    apiKey: string;
    apiModel: string;
    ttsUrl: string;
    ttsKey: string;
    ttsModel: string;
    sttUrl: string;
    sttKey: string;
    sttModel: string;
    systemPrompt: string;
    vlmUrl: string;
    vlmKey: string;
    vlmModel: string;
    vlmCorrectionModel: string;
  };
  onSaveSettings: (newSettings: any) => void;
  lang?: string;
}

export default function Sidebar({
  localStorageKeys,
  currentChatSuffix,
  onChatSelect,
  onNewChat,
  onDeleteAllChats,
  settings,
  onSaveSettings,
  lang = "en",
  setShowSettings,
  showSettings,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <div class={`sidebar bg-savanna rounded-lg shadow-lg h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          class="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
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

        <div class="p-4 flex-1 overflow-y-auto mt-12">
          <button
            onClick={onNewChat}
            class={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4 flex items-center justify-center ${isCollapsed ? 'px-2' : 'px-4'}`}
          >
            {isCollapsed ? '+' : 'New Chat'}
          </button>
          <div class="space-y-2">
            {localStorageKeys.sort().map((key) => {
              const suffix = key.slice(10);
              return (
                <button
                  key={suffix}
                  onClick={() => onChatSelect(suffix)}
                  class={`sidebar-button w-full text-left truncate ${suffix === currentChatSuffix ? 'active' : ''}`}
                >
                  {isCollapsed ? `#${parseInt(suffix) + 1}` : `Chat ${parseInt(suffix) + 1}`}
                </button>
              );
            })}
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 space-y-2">
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
            onClick={() => setShowSettings(true)}
            class="w-full text-white p-2 rounded hover:bg-gray-700 bg-gray-600 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class={`h-5 w-5 ${isCollapsed ? '' : 'mr-2'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            {!isCollapsed && 'Settings'}
          </button>
        </div>
      </div>
      {showSettings && (
        <Settings
          settings={settings}
          onSave={onSaveSettings}
          onClose={() => setShowSettings(false)}
          lang={lang}
        />
      )}
    </>
  );
}