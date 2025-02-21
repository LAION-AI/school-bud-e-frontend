import { ChevronDown } from "lucide-preact";
import type { ComponentChildren, VNode } from "preact";
import { useState, useEffect } from "preact/hooks";

interface CollapsibleSectionProps {
  icon: ComponentChildren;
  title: string;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: ComponentChildren;
  baseRoute: string;
  routePattern?: RegExp;
  onRouteMatch?: (match: RegExpMatchArray | null) => void;
}

export default function CollapsibleSection({
  icon,
  title,
  isCollapsed,
  isExpanded: propIsExpanded,
  onToggle,
  children,
  baseRoute,
  routePattern,
  onRouteMatch,
}: CollapsibleSectionProps) {
  const [isActive, setIsActive] = useState(false);
  const [shouldBeExpanded, setShouldBeExpanded] = useState(propIsExpanded);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const updateActiveAndExpanded = () => {
      const path = globalThis.location?.pathname;
      
      // Check if current path matches the route pattern or base route
      let isCurrentlyActive = false;
      let match: RegExpMatchArray | null = null;

      if (routePattern) {
        match = path?.match(routePattern) || null;
        isCurrentlyActive = Boolean(match);
      } else {
        isCurrentlyActive = Boolean(path?.startsWith(baseRoute));
      }

      // Update active state
      setIsActive(isCurrentlyActive);

      // Only auto-expand on initial route match
      if (!hasInitialized && isCurrentlyActive && !shouldBeExpanded) {
        setShouldBeExpanded(true);
        onToggle();
      }
      setHasInitialized(true);

      // Call onRouteMatch if provided
      if (onRouteMatch) {
        onRouteMatch(match);
      }
    };

    // Initial check
    updateActiveAndExpanded();

    // Listen for route changes
    globalThis.addEventListener('popstate', updateActiveAndExpanded);
    return () => globalThis.removeEventListener('popstate', updateActiveAndExpanded);
  }, [baseRoute, routePattern, onRouteMatch, shouldBeExpanded, onToggle, hasInitialized]);

  // Keep local expanded state in sync with prop
  useEffect(() => {
    setShouldBeExpanded(propIsExpanded);
  }, [propIsExpanded]);

  const handleToggle = () => {
    setShouldBeExpanded(!shouldBeExpanded);
    onToggle();
  };

  return (
    <div class="relative group">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={shouldBeExpanded}
        aria-controls={`${title.toLowerCase()}-content`}
        class={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-amber-500 ${
          isActive 
            ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
            : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
        }`}
      >
        <div class="flex items-center gap-3">
          <div class={`flex-shrink-0 ${isCollapsed ? "" : ""}`}>
            <div class={`h-5 w-5 transition-colors ${isActive ? "text-amber-800" : "text-gray-600 group-hover:text-gray-800"}`}>
              {icon}
            </div>
          </div>
          {!isCollapsed && (
            <span class="font-medium text-sm">
              {title}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            class={`h-4 w-4 transition-transform duration-200 ${
              isActive ? "text-amber-800" : "text-gray-500 group-hover:text-gray-700"
            } ${shouldBeExpanded ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {shouldBeExpanded && !isCollapsed && (
        <div 
          id={`${title.toLowerCase()}-content`}
          class="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-4"
        >
          {children}
        </div>
      )}
    </div>
  );
} 