import { useState } from "preact/hooks";
import { settingsContent } from "../internalization/content.ts";
import BasicSettings from "./settings/BasicSettings.tsx";
import ChatAPISettings from "./settings/ChatAPISettings.tsx";
import TTSSettings from "./settings/TTSSettings.tsx";
import STTSettings from "./settings/STTSettings.tsx";
import VLMSettings from "./settings/VLMSettings.tsx";
import { settings } from "./chat/store.ts";

export default function Settings({
  onClose,
  lang = "en",
}: {
  onClose: () => void;
  lang?: string;
}) {
  const [newSettings, setNewSettings] = useState({
    ...settings.value,
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
        const urlKey = `${serviceType}Url` as keyof typeof settings.value;
        const modelKey = `${serviceType}Model` as keyof typeof settings.value;

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

    updatedSettings[key as keyof typeof settings.value] = value;
    setNewSettings(updatedSettings);
  }

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 overflow-y-auto max-h-[90dvh]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">⚙️ {settingsContent[lang].title}</h2>
          <button
            onClick={onClose}
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {settingsContent[lang].back}
          </button>
        </div>

        <BasicSettings
          settings={newSettings}
          onUpdateSettings={updateSettings}
          lang={lang}
        />

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
            <ChatAPISettings
              settings={newSettings}
              onUpdateSettings={updateSettings}
              lang={lang}
            />
            <TTSSettings
              settings={newSettings}
              onUpdateSettings={updateSettings}
              lang={lang}
            />
            <STTSettings
              settings={newSettings}
              onUpdateSettings={updateSettings}
              lang={lang}
            />
            <VLMSettings
              settings={newSettings}
              onUpdateSettings={updateSettings}
              lang={lang}
            />
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
            onClick={() => settings.value = newSettings}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {settingsContent[lang].save}
          </button>
        </div>
      </div>
    </div>
  );
}
