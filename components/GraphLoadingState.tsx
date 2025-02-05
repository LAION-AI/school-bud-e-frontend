import { JSX } from "preact";

interface GraphLoadingStateProps {
  isLoading: boolean;
  isComplete: boolean;
  type: 'graph' | 'webresult' | 'game';
}

export function GraphLoadingState({ isLoading, isComplete, type }: GraphLoadingStateProps): JSX.Element {
  let subject = '';

  switch (type) {
    case 'graph':
      subject = 'Graph';
      break;
    case 'webresult':
      subject = 'Web results';
      break;
    case 'game':
      subject = 'Game';
      break;
  }

  return (
    <div class="flex items-center justify-center p-4 space-x-2 border rounded-md">
      {isLoading && !isComplete && (
        <>
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
          <span class="text-gray-700">Generating {subject}...</span>
        </>
      )}
      {!isLoading && isComplete && (
        <>
          <svg
            class="w-6 h-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span class="text-gray-700">{subject} generated successfully</span>
        </>
      )}
    </div>
  );
}