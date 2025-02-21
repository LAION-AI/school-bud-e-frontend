import { SidebarCloseIcon } from "lucide-preact";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function SidebarHeader({ isCollapsed, setIsCollapsed }: SidebarHeaderProps) {
  return (
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
  );
} 