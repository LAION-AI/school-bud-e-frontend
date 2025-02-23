import { useState } from "preact/hooks";
import CollapsibleSection from "./CollapsibleSection.tsx";

interface TestsSectionProps {
  isCollapsed: boolean;
}

export default function TestsSection({ isCollapsed }: TestsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const TestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-label="Tests icon">
      <title>Tests and Assessments Section</title>
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
    </svg>
  );

  return (
    <CollapsibleSection
      icon={<TestIcon />}
      title="Tests"
      isCollapsed={isCollapsed}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      baseRoute="/tests"
    >
      <a
        href="/tests/generate"
        class="block px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        Generate Tests
      </a>
      <a
        href="/tests/check"
        class="block px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        Check Tests
      </a>
    </CollapsibleSection>
  );
}
