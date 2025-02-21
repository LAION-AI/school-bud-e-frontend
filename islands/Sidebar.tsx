import { useEffect, useState } from "preact/hooks";
import { deleteChat } from "../components/chat/store.ts";
import SidebarHeader from "../components/sidebar/SidebarHeader.tsx";
import GamesSection from "../components/sidebar/GamesSection.tsx";
import GraphsSection from "../components/sidebar/GraphsSection.tsx";
import ChatList from "../components/sidebar/ChatList.tsx";
import VideoNovelLink from "../components/sidebar/VideoNovelLink.tsx";
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
			class={`sidebar bg-white rounded-2xl shadow-lg h-full flex flex-col transition-all duration-300 ease-in-out ${
				isCollapsed ? "w-0 overflow-hidden" : "w-[21rem]"
			}`}
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
		</div>
	);
}
