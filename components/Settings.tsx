import { useState } from "preact/hooks";
import { settingsContent } from "../internalization/content.ts";

export default function Settings({
  settings,
  onSave,
  onClose,
  lang = "en",
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
    ...settings,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const providerConfigs = {
    googleai: {
      keyCharacteristics: { startsWith: "AI" },
      config: {
        api: {
          url:
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          model: "gemini-1.5-flash",
        },
        vlm: {
          url:
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          model: "gemini-1.5-flash",
        },
      },
    },
    hyprlab: {
      keyCharacteristics: { startsWith: "hypr-lab" },
      config: {
        api: {
          url: "https://api.hyprlab.io/v1/chat/completions",
          model: "gemini-1.5-pro",
        },
        vlm: {
          url: "https://api.hyprlab.io/v1/chat/completions",
          model: "gemini-1.5-pro",
        },
      },
    },
    groq: {
      keyCharacteristics: { startsWith: "gsk_" },
      config: {
        api: {
          url: "https://api.groq.com/openai/v1/chat/completions",
          model: "llama-3.3-70b-versatile",
        },
        vlm: {
          url: "https://api.groq.com/openai/v1/chat/completions",
          model: "llama-3.2-90b-vision-preview",
        },
        stt: {
          url: "https://api.groq.com/openai/v1/audio/transcriptions",
          model: "whisper-large-v3-turbo",
        },
      },
    },
    sambanova: {
      keyCharacteristics: { length: 36 },
      config: {
        api: {
          url: "https://api.sambanova.ai/v1/chat/completions",
          model: "Meta-Llama-3.3-70B-Instruct",
        },
        vlm: {
          url: "https://api.sambanova.ai/v1/chat/completions",
          model: "Meta-Llama-3.2-90B-Vision-Instruct",
        },
      },
    },
    fish: {
      keyCharacteristics: { length: 32 },
      config: {
        tts: {
          url: "https://api.fish.audio/v1/tts",
          model: lang === "de" ? "61561f50f41046e0b267aa4cb30e4957" : "6f45f4694ff54d6980337a68902e20d7",
        },
      },
    },
    deepgram: {
      keyCharacteristics: { length: 40 },
      config: {
        stt: {
          url: `https://api.deepgram.com/v1/listen?language=en&model=nova-2`,
          model: "nova-2",
        },
        tts: {
          url: `https://api.deepgram.com/v1/speak?model=aura-helios-en`,
          model: "aura-helios-en",
        },
      },
    },
  };

  function updateSettings(key: string, value: string) {
    const updatedSettings = { ...newSettings };

    if (key !== "universalApiKey") {
      if (key.endsWith("Key") && value !== "") {
        const serviceType = key.slice(0, -3);
        const urlKey = `${serviceType}Url` as keyof typeof settings;
        const modelKey = `${serviceType}Model` as keyof typeof settings;

        // Find matching provider based on key characteristics
        const provider = Object.values(providerConfigs).find((provider) => {
          const { keyCharacteristics } = provider;
          return (
            ("startsWith" in keyCharacteristics &&
              value.startsWith(keyCharacteristics.startsWith)) ||
            ("length" in keyCharacteristics &&
              keyCharacteristics.length === value.length)
          );
        });

        if (provider?.config[serviceType as keyof typeof provider.config]) {
          const serviceConfig = provider
            .config[serviceType as keyof typeof provider.config] as {
              url: string;
              model: string;
            };
          updatedSettings[urlKey] = serviceConfig.url;
          updatedSettings[modelKey] = serviceConfig.model;
        }
      }
    }

    updatedSettings[key as keyof typeof settings] = value;
    setNewSettings(updatedSettings);
  }

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
              updateSettings(
                "universalApiKey",
                (e.target as HTMLInputElement).value,
              )}
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-yellow-50"
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
              <h3 class="font-medium mb-2">
                💬 {settingsContent[lang].chatApiTitle}
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {settingsContent[lang].apiKeyLabel}
                  </label>
                  <input
                    type="password"
                    value={newSettings.apiKey}
                    onChange={(e) =>
                      updateSettings(
                        "apiKey",
                        (e.target as HTMLInputElement).value,
                      )}
                    class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-yellow-50"
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
                      updateSettings(
                        "apiUrl",
                        (e.target as HTMLInputElement).value,
                      )}
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
                      updateSettings(
                        "apiModel",
                        (e.target as HTMLInputElement).value,
                      )}
                    class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder={settingsContent[lang].modelPlaceholder}
                  />
                </div>
              </div>
            </div>

            {/* TTS Settings */}
            <div class="mb-4">
              <h3 class="font-medium mb-2">
                🗣️ {settingsContent[lang].ttsTitle}
              </h3>
              <div class="space-y-4">
                <input
                  type="password"
                  value={newSettings.ttsKey}
                  onChange={(e) =>
                    updateSettings(
                      "ttsKey",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                  placeholder={settingsContent[lang].ttsKeyPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.ttsUrl}
                  onChange={(e) =>
                    updateSettings(
                      "ttsUrl",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].ttsUrlPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.ttsModel}
                  onChange={(e) =>
                    updateSettings(
                      "ttsModel",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].ttsModelPlaceholder}
                />
              </div>
            </div>

            {/* STT Settings */}
            <div class="mb-4">
              <h3 class="font-medium mb-2">
                👂 {settingsContent[lang].sttTitle}
              </h3>
              <div class="space-y-4">
                <input
                  type="password"
                  value={newSettings.sttKey}
                  onChange={(e) =>
                    updateSettings(
                      "sttKey",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                  placeholder={settingsContent[lang].sttKeyPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.sttUrl}
                  onChange={(e) =>
                    updateSettings(
                      "sttUrl",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].sttUrlPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.sttModel}
                  onChange={(e) =>
                    updateSettings(
                      "sttModel",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].sttModelPlaceholder}
                />
              </div>
            </div>

            {/* VLM Settings */}
            <div class="mb-4">
              <h3 class="font-medium mb-2">
                👀 {settingsContent[lang].vlmTitle}
              </h3>
              <div class="space-y-4">
                <input
                  type="password"
                  value={newSettings.vlmKey}
                  onChange={(e) =>
                    updateSettings(
                      "vlmKey",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                  placeholder={settingsContent[lang].vlmKeyPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.vlmUrl}
                  onChange={(e) =>
                    updateSettings(
                      "vlmUrl",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].vlmUrlPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.vlmModel}
                  onChange={(e) =>
                    updateSettings(
                      "vlmModel",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang].vlmModelPlaceholder}
                />
                <input
                  type="text"
                  value={newSettings.vlmCorrectionModel}
                  onChange={(e) =>
                    updateSettings(
                      "vlmCorrectionModel",
                      (e.target as HTMLInputElement).value,
                    )}
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={settingsContent[lang]
                    .vlmCorrectionModelPlaceholder}
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
