import { useState } from "preact/hooks";
import { settingsContent, chatContent } from "../internalization/content.ts";

export default function Settings({
  settings,
  onSave,
  onClose,
  lang = 'en'
}: {
  settings: {
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
  const [newSettings, setNewSettings] = useState({ ...settings });

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 overflow-y-scroll max-h-[90dvh]">
        <h2 class="text-xl font-bold mb-4">{settingsContent[lang].title}</h2>

        {/* <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].systemPromptLabel}
          </label>
          <textarea
            value={newSettings.systemPrompt}
            placeholder={chatContent[lang].systemPrompt}
            onChange={(e) =>
              setNewSettings({ ...newSettings, systemPrompt: (e.target as HTMLTextAreaElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
          />
        </div> */}

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

        <div class="mb-6">
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

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].ttsUrlLabel}
          </label>
          <input
            type="text"
            value={newSettings.ttsUrl}
            onChange={(e) =>
              setNewSettings({ ...newSettings, ttsUrl: (e.target as HTMLInputElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].ttsUrlPlaceholder}
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].ttsKeyLabel}
          </label>
          <input
            type="password"
            value={newSettings.ttsKey}
            onChange={(e) =>
              setNewSettings({ ...newSettings, ttsKey: (e.target as HTMLInputElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].ttsKeyPlaceholder}
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].ttsModelLabel}
          </label>
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

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].sttUrlLabel}
          </label>
          <input
            type="text"
            value={newSettings.sttUrl}
            onChange={(e) =>
              setNewSettings({ ...newSettings, sttUrl: (e.target as HTMLInputElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].sttUrlPlaceholder}
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].sttKeyLabel}
          </label>
          <input
            type="password"
            value={newSettings.sttKey}
            onChange={(e) =>
              setNewSettings({ ...newSettings, sttKey: (e.target as HTMLInputElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].sttKeyPlaceholder}
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].sttModelLabel}
          </label>
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

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].vlmUrlLabel}
          </label>
          <input
            type="text"
            value={newSettings.vlmUrl}
            onChange={(e) =>
              setNewSettings({ ...newSettings, vlmUrl: (e.target as HTMLInputElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].vlmUrlPlaceholder}
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].vlmKeyLabel}
          </label>
          <input
            type="password"
            value={newSettings.vlmKey}
            onChange={(e) =>
              setNewSettings({ ...newSettings, vlmKey: (e.target as HTMLInputElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].vlmKeyPlaceholder}
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].vlmModelLabel}
          </label>
          <input
            type="text"
            value={newSettings.vlmModel}
            onChange={(e) =>
              setNewSettings({ ...newSettings, vlmModel: (e.target as HTMLInputElement).value })
            }
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder={settingsContent[lang].vlmModelPlaceholder}
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {settingsContent[lang].vlmCorrectionModelLabel}
          </label>
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
