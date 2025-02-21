import { BookOpen } from "lucide-preact";

export default function VideoNovelLink({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div>
      <a
        href="/video-novel"
        class="w-full p-2 rounded hover:bg-blue-100 flex items-center"
      >
        <BookOpen class={`h-5 w-5 ${isCollapsed ? "" : "mr-2"}`} />
        {!isCollapsed && "Video Novel"}
      </a>
    </div>
  );
} 