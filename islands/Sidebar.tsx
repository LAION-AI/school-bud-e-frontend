import { useEffect, useState } from "preact/hooks";
import { deleteChat } from "../components/chat/store.ts";
import SidebarHeader from "../components/sidebar/SidebarHeader.tsx";
import GamesSection from "../components/sidebar/GamesSection.tsx";
import GraphsSection from "../components/sidebar/GraphsSection.tsx";
import ChatList from "../components/sidebar/ChatList.tsx";
import VideoNovelLink from "../components/sidebar/VideoNovelLink.tsx";
import TestsSection from "../components/sidebar/TestsSection.tsx";
import UserProfileSection from "../components/sidebar/UserProfileSection.tsx";

interface SidebarProps {
	currentChatSuffix: string;
	onDownloadChat: () => void;
	lang?: string;
}

export default function Sidebar({
	currentChatSuffix,
	lang = "en",
	onDownloadChat,
}: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
		const urlParams = new URLSearchParams(globalThis.location?.search);
		const collapsed = urlParams.get("collapsed");
		return collapsed === "true";
	});

	useEffect(() => {
		const urlParams = new URLSearchParams(globalThis.location?.search);
		urlParams.set("collapsed", `${isCollapsed}`);
		const newUrl = `${globalThis.location.origin}${globalThis.location?.pathname}?${urlParams.toString()}`;
		globalThis.history?.replaceState(null, "", newUrl);
	}, [isCollapsed]);

	return (
		<div
			class={`sidebar bg-white rounded-2xl shadow-lg h-full flex flex-col transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-0 overflow-hidden" : "w-[21rem]"}`}
		>
			<SidebarHeader
				isCollapsed={isCollapsed}
				setIsCollapsed={setIsCollapsed}
			/>

			<div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
				<div class="p-3 space-y-3">
					<GamesSection isCollapsed={isCollapsed} />
					<GraphsSection isCollapsed={isCollapsed} />
					<VideoNovelLink isCollapsed={isCollapsed} />
					<TestsSection isCollapsed={isCollapsed} />
					<ChatList
						isCollapsed={isCollapsed}
						currentChatSuffix={currentChatSuffix}
						onDownloadChat={onDownloadChat}
						onDeleteChat={deleteChat}
					/>
				</div>
			</div>

			<div class="p-3 pt-0">
				<UserProfileSection isCollapsed={isCollapsed} lang={lang} />
			</div>
			{isCollapsed && (
				<button
					type="button"
					onClick={() => setIsCollapsed(false)}
					class="absolute left-full top-4 p-2 bg-white rounded-r-lg shadow-md hover:bg-gray-50 transition-colors"
					aria-label="Expand sidebar"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-gray-500"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-label="Expand sidebar icon"
					>
						<title>Expand sidebar navigation</title>
						<path
							fillRule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			)}
		</div>
	);
}
