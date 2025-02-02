import { JSX } from "preact";

interface GraphLoadingStateProps {
  isLoading: boolean;
  isComplete: boolean;
}

export function GraphLoadingState({ isLoading, isComplete }: GraphLoadingStateProps): JSX.Element {
  return (
    <div class="flex items-center justify-center p-4 space-x-2">
      {isLoading && !isComplete && (
        <>
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
          <span class="text-gray-700">Generating graph...</span>
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
          <span class="text-gray-700">Graph generated successfully</span>
        </>
      )}
    </div>
  );
}