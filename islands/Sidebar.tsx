import { useEffect, useState } from "preact/hooks";
import { useComputed } from "@preact/signals";
import {
	SidebarCloseIcon,
	X,
	Download,
	Settings as SettingsIcon,
	GamepadIcon,
	BookOpen,
	User,
	ChevronDown,
} from "lucide-preact";
import Settings from "../components/Settings.tsx";
import { chats, deleteChat } from "../components/chat/store.ts";
import { graphs, deleteGraph } from "../components/graph/store.ts";
import EditIcon from "../components/icons/EditIcon.tsx";
import Header from "./Header.tsx";

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
	const [showSettings, setShowSettings] = useState(false);
	const [gamesExpanded, setGamesExpanded] = useState(false);
	const [graphsExpanded, setGraphsExpanded] = useState(false);

	useEffect(() => {
		const urlParams = new URLSearchParams(globalThis.location?.search);
		urlParams.set("collapsed", `${isCollapsed}`);
		const newUrl = `${globalThis.location.origin}${globalThis.location?.pathname}?${urlParams.toString()}`;
		globalThis.history?.replaceState(null, "", newUrl);
	}, [isCollapsed]);

	const lastThreeGraphs = useComputed(() => {
		const value = (Array.from(graphs.value.keys()) as string[])
			.sort((a, b) => b?.length - a?.length)
			.slice(0, 59);
		console.log(value);
		return value;
	});

	return (
		<div
			class={`sidebar bg-surface rounded-lg shadow-lg h-full flex flex-col transition-all duration-300 ${isCollapsed ? "w-0 overflow-hidden" : "w-[21rem]"}`}
		>
			<div class="flex justify-between py-4">
				<img
					src="/logo.png"
					width="48"
					height="48"
					alt="A little lion wearing a graduation cap."
				/>
				<button
					type="button"
					onClick={() => setIsCollapsed(!isCollapsed)}
					class={`p-4 rounded-full hover:bg-blue-100 text-gray-500 transition-colors ${isCollapsed ? "absolute left-4 z-10 " : ""}`}
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					<SidebarCloseIcon
						class={`h-6 w-6 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
						aria-hidden="true"
					/>
				</button>
			</div>
			<div class="px-2 flex-1 overflow-y-auto">
				<div class="flex justify-between items-center mb-4">
					<a
						href="/chat/new"
						type="button"
						class={`flex-1 border p-2 rounded flex items-center justify-center ${isCollapsed ? "px-2" : "px-4"}`}
					>
						<EditIcon />
					</a>
					<a href="/profile" class="ml-2 p-2 rounded hover:bg-blue-100">
						<User size={20} />
					</a>
				</div>

				<div class="space-y-2">
					<div>
						<button
							onClick={() => setGamesExpanded(!gamesExpanded)}
							class="w-full p-2 rounded hover:bg-blue-100 flex items-center justify-between"
						>
							<div class="flex items-center">
								<GamepadIcon class={`h-5 w-5 ${isCollapsed ? "" : "mr-2"}`} />
								{!isCollapsed && "Games"}
							</div>
							<ChevronDown
								class={`h-4 w-4 transition-transform ${gamesExpanded ? "rotate-180" : ""}`}
							/>
						</button>
						{gamesExpanded && !isCollapsed && (
							<div class="space-y-1">
								<a
									href="/game/math"
									class="block p-2 pl-8 hover:bg-blue-100 rounded"
								>
									Math Game
								</a>
								<a
									href="/game/language"
									class="block p-2 pl-8 hover:bg-blue-100 rounded"
								>
									Language Game
								</a>
								<a
									href="/game/quiz"
									class="block p-2 pl-8 hover:bg-blue-100 rounded"
								>
									Quiz Game
								</a>
							</div>
						)}
					</div>
					<div>
						<button
							type="button"
							onClick={() => setGraphsExpanded(!graphsExpanded)}
							class="w-full p-2 rounded hover:bg-blue-100 flex items-center justify-between"
						>
							<div class="flex items-center">
								<BookOpen class={`h-5 w-5 ${isCollapsed ? "" : "mr-2"}`} />
								Learning Graphs
							</div>
							<ChevronDown
								class={`h-4 w-4 transition-transform ${graphsExpanded ? "rotate-180" : ""}`}
							/>
						</button>
						{graphsExpanded && !isCollapsed && (
							<div class="space-y-1">
								{lastThreeGraphs.value.map((graphId) => (
									<div key={graphId} class="flex items-center">
										<a
											href={`/graph/${graphId}`}
											class="flex-1 block p-2 pl-8 hover:bg-blue-100 rounded"
										>
											{console.log(graphs.value.get(graphId))}
											{graphs.value.get(graphId)?.name || graphId}
										</a>
										<button
											type="button"
											onClick={() => deleteGraph(graphId)}
											class="p-2 text-gray-400 hover:text-red-600"
											aria-label="Delete graph"
										>
											<X size={16} />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div class="space-y-2 pt-4">
					{Object.keys(chats.value)
						.sort()
						.map((key) => {
							const suffix = key.slice(10);
							return (
								<div
									key={suffix}
									class={`flex items-center rounded-md group border ${suffix === currentChatSuffix ? "" : "border-transparent"}`}
								>
									<a
										href={`/chat/${suffix}`}
										class="sidebar-button w-full px-3 py-2 text-left truncate"
									>
										{isCollapsed
											? `#${Number.parseInt(suffix) + 1}`
											: `Chat ${Number.parseInt(suffix) + 1}`}
									</a>
									<button
										type="button"
										onClick={onDownloadChat}
										class="group-hover:text-gray-400 text-transparent"
									>
										<Download class={`h-5 w-5`} />
									</button>
									<button
										type="button"
										onClick={() => deleteChat(suffix)}
										class="group-hover:text-gray-400 text-transparent"
									>
										<X size={24} />
									</button>
								</div>
							);
						})}
				</div>
			</div>
			<div class="p-4 border-t space-y-2">
			<div class={"flex items-center rounded-md group border"}>
				<a
					href={"/video-novel"}
					class="sidebar-button w-full px-3 py-2 text-left truncate"
				>
					Video Novel
				</a>
			</div>
			</div>

			<div class="p-4 border-t space-y-2">
				<button
					type="button"
					onClick={() => setShowSettings(true)}
					class="w-full rounded flex items-center justify-center"
				>
					<SettingsIcon class={isCollapsed ? "" : "mr-2"} />
					{!isCollapsed && "Settings"}
				</button>
				<Header lang="en" />
			</div>
			{showSettings && (
				<Settings onClose={() => setShowSettings(false)} lang={lang} />
			)}
		</div>
	);
}
