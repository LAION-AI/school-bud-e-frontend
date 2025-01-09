import { useState } from "preact/hooks";
import { settingsContent } from "../internalization/content.ts";

export default function Settings({
  settings,
  onSave,
  onClose,
  lang = 'en'
}: {
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
  onSave: (newSettings: typeof settings) => void;
  onClose: () => void;
  lang?: string;
}) {
  const [newSettings, setNewSettings] = useState({ 
    ...settings 
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 overflow-y-scroll max-h-[90dvh]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">⚙️ {settingsContent[lang].title}</h2>
          <button
            onClick={onClose}
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {settingsContent[lang].back}
          </button>
        </div>

        {/* Basic Settings */}
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            🌐 {settingsContent[lang].universalApiKeyLabel}
          </label>
          <input
            type="password"
            value={newSettings.universalApiKey}
            onChange={(e) =>
              setNewSettings({ 
                ...newSettings, 
                universalApiKey: (e.target as HTMLInputElement).value
              })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].universalApiKeyPlaceholder}
          />
        </div>

        {/* Advanced Settings Toggle Button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          class="mb-4 text-blue-500 hover:text-blue-600"
        >
          {showAdvanced 
            ? settingsContent[lang].lessSettings
            : settingsContent[lang].advancedSettings}
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <>
            {/* Chat API Settings */}
            <div class="mb-4">
              <h3 class="font-medium mb-2">💬 {settingsContent[lang].chatApiTitle}</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {settingsContent[lang].apiKeyLabel}
                  </label>
                  <input
                    type="password"
                    value={newSettings.apiKey}
                    onChange={(e) =>
                      setNewSettings({ ...newSettings, apiKey: (e.target as HTMLInputElement).value })
                    }
                    class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder={settingsContent[lang].apiKeyPlaceholder}
                  />
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {settingsContent[lang].apiUrlLabel}
                  </label>
                  <input
                    type="text"
                    value={newSettings.apiUrl}
                    onChange={(e) =>
                      setNewSettings({ ...newSettings, apiUrl: (e.target as HTMLInputElement).value })
                    }
                    class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder={settingsContent[lang].apiUrlPlaceholder}
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {settingsContent[lang].modelLabel}
                  </label>
                  <input
                    type="text"
                    value={newSettings.apiModel}
                    onChange={(e) =>
                      setNewSettings({ ...newSettings, apiModel: (e.target as HTMLInputElement).value })
                    }
                    class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder={settingsContent[lang].modelPlaceholder}
                  />
                </div>
              </div>
            </div>

            {/* TTS Settings */}
            <div class="mb-4">
              <h3 class="font-medium mb-2">🗣️ {settingsContent[lang].ttsTitle}</h3>
              <div class="space-y-4">
                <input
                  type="text"
                  value={newSettings.ttsUrl}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, ttsUrl: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].ttsUrlPlaceholder}
                />
                <input
                  type="password"
                  value={newSettings.ttsKey}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, ttsKey: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].ttsKeyPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.ttsModel}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, ttsModel: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].ttsModelPlaceholder}
                />
              </div>
            </div>

            {/* STT Settings */}
            <div class="mb-4">
              <h3 class="font-medium mb-2">👂 {settingsContent[lang].sttTitle}</h3>
              <div class="space-y-4">
                <input
                  type="text"
                  value={newSettings.sttUrl}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, sttUrl: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].sttUrlPlaceholder}
                />
                <input
                  type="password"
                  value={newSettings.sttKey}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, sttKey: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].sttKeyPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.sttModel}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, sttModel: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].sttModelPlaceholder}
                />
              </div>
            </div>

            {/* VLM Settings */}
            <div class="mb-4">
              <h3 class="font-medium mb-2">👀 {settingsContent[lang].vlmTitle}</h3>
              <div class="space-y-4">
                <input
                  type="text"
                  value={newSettings.vlmUrl}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, vlmUrl: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].vlmUrlPlaceholder}
                />
                <input
                  type="password"
                  value={newSettings.vlmKey}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, vlmKey: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].vlmKeyPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.vlmModel}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, vlmModel: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].vlmModelPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.vlmCorrectionModel}
                  onChange={(e) =>
                    setNewSettings({ ...newSettings, vlmCorrectionModel: (e.target as HTMLInputElement).value })
                  }
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].vlmCorrectionModelPlaceholder}
                />
              </div>
            </div>
          </>
        )}

        <div class="flex justify-end space-x-4">
          <button
            onClick={onClose}
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {settingsContent[lang].cancel}
          </button>
          <button
            onClick={() => onSave(newSettings)}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {settingsContent[lang].save}
          </button>
        </div>
      </div>
    </div>
  );
}
