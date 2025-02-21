import { useState } from "preact/hooks";
import { User } from "lucide-preact";
import { settings } from "../chat/store.ts";
import { settingsContent } from "../../internalization/content.ts";
import BasicSettings from "../settings/BasicSettings.tsx";
import ConfigurationSelector from "../settings/ConfigurationSelector.tsx";

interface UserData {
	name?: string;
	email?: string;
	avatar?: string;
	preferences?: {
		language?: string;
		theme?: string;
	};
}

export default function UserProfileSection({ 
	isCollapsed,
	lang = "en"
}: { 
	isCollapsed: boolean;
	lang?: string;
}) {
	const [userData, setUserData] = useState<UserData>(() => {
		const storedData = localStorage.getItem("userData");
		return storedData ? JSON.parse(storedData) : {};
	});
	const [newSettings, setNewSettings] = useState({
		...settings.value,
	});
	const [showSettings, setShowSettings] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);

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

	return (
		<div class="border-t pt-2">
			<div class="flex items-center p-2 space-x-3">
				<div class="flex-shrink-0">
					<div class="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
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
				</div>
				<div class="flex-grow min-w-0">
					<div class="text-sm font-medium truncate">
						{userData.name || (lang === "de" ? "Benutzerprofil" : "User Profile")}
					</div>
					{userData.email && (
						<div class="text-xs text-gray-500 truncate">{userData.email}</div>
					)}
				</div>
				<button
					type="button"
					onClick={() => setShowSettings(!showSettings)}
					class="p-2 rounded hover:bg-blue-100 transition-colors"
					aria-label={showSettings ? "Close settings" : "Open settings"}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						role="img"
						aria-label="Settings"
					>
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
				</button>
			</div>

			{showSettings && (
				<div class="px-2 py-4 space-y-4 border-t">
					{/* Profile Section */}
					<div class="space-y-4">
						<div>
							<label htmlFor="sidebar-name" class="block text-sm font-medium text-gray-700">
								{lang === "de" ? "Name" : "Name"}
							</label>
							<input
								id="sidebar-name"
								type="text"
								value={userData.name || ""}
								onChange={(e) =>
									updateUserData({
										name: (e.target as HTMLInputElement).value,
									})
								}
								class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label htmlFor="sidebar-email" class="block text-sm font-medium text-gray-700">
								{lang === "de" ? "E-Mail" : "Email"}
							</label>
							<input
								id="sidebar-email"
								type="email"
								value={userData.email || ""}
								onChange={(e) =>
									updateUserData({
										email: (e.target as HTMLInputElement).value,
									})
								}
								class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Settings Section */}
					<div class="space-y-4">
						<h4 class="font-medium">⚙️ {settingsContent[lang].title}</h4>
						
						<BasicSettings
							settings={newSettings}
							onUpdateSettings={updateSettings}
							lang={lang}
						/>

						{/* Advanced Settings Toggle Button */}
						<button
							type="button"
							onClick={() => setShowAdvanced(!showAdvanced)}
							class="text-sm text-blue-500 hover:text-blue-600"
						>
							{showAdvanced
								? settingsContent[lang].lessSettings
								: settingsContent[lang].advancedSettings}
						</button>

						{/* Advanced Settings */}
						{showAdvanced && (
							<div class="space-y-4">
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
							</div>
						)}

						{/* Save Settings Button */}
						<button
							type="button"
							onClick={() => {
								settings.value = { ...newSettings };
								setShowSettings(false);
							}}
							class="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							{settingsContent[lang].save}
						</button>
					</div>
				</div>
			)}
		</div>
	);
} 