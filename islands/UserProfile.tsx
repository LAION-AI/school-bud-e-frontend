import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import ImageUploadButton from "../components/ImageUploadButton.tsx";
import BasicSettings from "../components/settings/BasicSettings.tsx";
import ConfigurationSelector from "../components/settings/ConfigurationSelector.tsx";
import { settings } from "../components/chat/store.ts";
import { settingsContent } from "../internalization/content.ts";

interface UserProfileProps {
	lang: string;
}

interface UserData {
	name?: string;
	email?: string;
	avatar?: string;
	preferences?: {
		language?: string;
		theme?: string;
	};
}

export function UserProfile({ lang }: UserProfileProps): JSX.Element {
	const [userData, setUserData] = useState<UserData>({});
	const [newSettings, setNewSettings] = useState({
		...settings.value,
	});
	const [showAdvanced, setShowAdvanced] = useState(false);

	useEffect(() => {
		// Load user data from localStorage on component mount
		const storedData = localStorage.getItem("userData");
		if (storedData) {
			setUserData(JSON.parse(storedData));
		}
	}, []);

	const updateUserData = (newData: Partial<UserData>) => {
		const updatedData = { ...userData, ...newData };
		setUserData(updatedData);
		localStorage.setItem("userData", JSON.stringify(updatedData));
	};

	const updateSettings = (key: string, value: string) => {
		setNewSettings((newSettings) => {
			const updatedSettings = { ...newSettings };
			updatedSettings[key as keyof typeof settings.value] = value;
			return updatedSettings;
		});
	};

	const providerConfigs = {
		googleai: {
			keyCharacteristics: { startsWith: "AI" },
			config: {
				api: {
					url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
					model: "gemini-1.5-flash",
				},
				vlm: {
					url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
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
					url: "https://api.deepgram.com/v1/listen?language=en&model=nova-2",
					model: "nova-2",
				},
				tts: {
					url: "https://api.deepgram.com/v1/speak?model=aura-helios-en",
					model: "aura-helios-en",
				},
			},
		},
	};

	return (
		<>
			<div class="p-4 bg-white rounded-lg shadow">
				<h2 class="text-2xl font-bold mb-4">
					{lang === "de" ? "Benutzerprofil" : "User Profile"}
				</h2>
				<div class="space-y-4">
					<div class="flex items-center space-x-4">
						<div class="flex-shrink-0">
							<div class="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
								{userData.avatar ? (
									<img
										src={userData.avatar}
										alt="User avatar"
										class="w-full h-full object-cover"
									/>
								) : (
									<svg
										class="w-full h-full text-gray-300"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-label="Default user avatar"
										role="img"
									>
										<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
									</svg>
								)}
							</div>
							<ImageUploadButton
								onImagesUploaded={(images) => {
									if (images.length > 0 && images[0].type === "image_url") {
										updateUserData({ avatar: images[0].image_url.url });
									}
								}}
							/>
						</div>
						<div class="flex-grow space-y-4">
							<div>
								<label htmlFor="name" class="block text-sm font-medium text-gray-700">
									{lang === "de" ? "Name" : "Name"}
								</label>
								<input
									id="name"
									type="text"
									value={userData.name || ""}
									onChange={(e) =>
										updateUserData({
											name: (e.target as HTMLInputElement).value,
										})
									}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label htmlFor="email" class="block text-sm font-medium text-gray-700">
									{lang === "de" ? "E-Mail" : "Email"}
								</label>
								<input
									id="email"
									type="email"
									value={userData.email || ""}
									onChange={(e) =>
										updateUserData({
											email: (e.target as HTMLInputElement).value,
										})
									}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
						</div>
					</div>

					{/* Settings Section */}
					<div class="mt-8">
						<h3 class="text-xl font-bold mb-4">⚙️ {settingsContent[lang].title}</h3>
						
						<BasicSettings
							settings={newSettings}
							onUpdateSettings={updateSettings}
							lang={lang}
						/>

						{/* Advanced Settings Toggle Button */}
						<button
							type="button"
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
								<ConfigurationSelector
									serviceType="api"
									currentConfig={{
										url: newSettings.apiUrl,
										model: newSettings.apiModel,
										key: newSettings.apiKey,
									}}
									onUpdateSettings={updateSettings}
									lang={lang}
									icon="💬"
									title={settingsContent[lang].chatApiTitle}
								/>
								<ConfigurationSelector
									serviceType="tts"
									currentConfig={{
										url: newSettings.ttsUrl,
										model: newSettings.ttsModel,
										key: newSettings.ttsKey,
									}}
									onUpdateSettings={updateSettings}
									lang={lang}
									icon="🗣️"
									title={settingsContent[lang].ttsTitle}
								/>
								<ConfigurationSelector
									serviceType="stt"
									currentConfig={{
										url: newSettings.sttUrl,
										model: newSettings.sttModel,
										key: newSettings.sttKey,
									}}
									onUpdateSettings={updateSettings}
									lang={lang}
									icon="👂"
									title={settingsContent[lang].sttTitle}
								/>
								<ConfigurationSelector
									serviceType="vlm"
									currentConfig={{
										url: newSettings.vlmUrl,
										model: newSettings.vlmModel,
										key: newSettings.vlmKey,
									}}
									onUpdateSettings={updateSettings}
									lang={lang}
									icon="👀"
									title={settingsContent[lang].vlmTitle}
								/>
							</>
						)}

						{/* Save Settings Button */}
						<div class="mt-4">
							<button
								type="button"
								onClick={() => {
									settings.value = { ...newSettings };
								}}
								class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								{settingsContent[lang].save}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
