import { useEffect, useState } from "preact/hooks";
import { deleteChat } from "../../components/chat/store.ts";
import SidebarHeader from "./SidebarHeader.tsx";
import GamesSection from "./GamesSection.tsx";
import GraphsSection from "./GraphsSection.tsx";
import PresentationsSection from "./PresentationsSection.tsx";
import ChatList from "./ChatList.tsx";
import VideoNovelLink from "./VideoNovelLink.tsx";
import TestsSection from "./TestsSection.tsx";
import UserProfileSection from "./UserProfileSection.tsx";
import { TourProgressSidebarSection } from "../../components/sidebar/TourProgressSidebarSection.tsx";

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

	// State to manage which section is highlighted
	const [selectedSection, setSelectedSection] = useState<string | null>(null);

	// Event listener to handle link clicks in the sidebar
	const handleLinkClick = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		const anchor = target.closest('a');
		if (anchor && anchor.getAttribute('href')) {
			const href = anchor.getAttribute('href')!;
			if (href.startsWith('/games')) {
				setSelectedSection('games');
			} else if (href.startsWith('/graphs')) {
				setSelectedSection('graphs');
			} else if (href.startsWith('/presentations')) {
				setSelectedSection('presentations');
			} else if (href.startsWith('/tests')) {
				setSelectedSection('tests');
			} else {
				setSelectedSection(null);
			}
		}
	};

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
				<div class="p-3 space-y-3" onClick={handleLinkClick}>
					<GamesSection 
						isCollapsed={isCollapsed}
						highlight={selectedSection === 'games'}
					/>
					<GraphsSection 
						isCollapsed={isCollapsed}
						highlight={selectedSection === 'graphs'}
					/>
					<PresentationsSection 
						isCollapsed={isCollapsed}
						highlight={selectedSection === 'presentations'}
					/>
					<VideoNovelLink isCollapsed={isCollapsed} />
					<TestsSection 
						isCollapsed={isCollapsed}
						highlight={selectedSection === 'tests'}
					/>
					<ChatList
						isCollapsed={isCollapsed}
						currentChatSuffix={currentChatSuffix}
						onDownloadChat={onDownloadChat}
						onDeleteChat={deleteChat}
					/>
					<TourProgressSidebarSection />
				</div>
			</div>

			<div class="p-3 pt-0">
				<UserProfileSection isCollapsed={isCollapsed} lang={lang} />
			</div>
		</div>
	);
}
