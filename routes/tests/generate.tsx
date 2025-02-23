import { PageProps } from "$fresh/server.ts";
import FloatingChat from "../../components/chat/FloatingChat.tsx";

export default function GenerateTestsPage(props: PageProps) {
  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
          <h1 class="text-3xl font-bold text-white">Generate Tests</h1>
          <p class="text-blue-100 mt-2">Create custom tests with AI assistance</p>
        </div>
        
        <div class="p-6 space-y-6">
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Test Parameters</h2>
            <form class="space-y-4">
              <div>
                <label htmlFor="subject-area" class="block text-sm font-medium text-gray-700 mb-1">
                  Subject Area
                </label>
                <input
                  id="subject-area"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mathematics, History, Science"
                />
              </div>
              <div>
                <label htmlFor="topics" class="block text-sm font-medium text-gray-700 mb-1">
                  Topics
                </label>
                <textarea
                  id="topics"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter specific topics to cover"
                />
              </div>
              <div>
                <label htmlFor="difficulty" class="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="question-count" class="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions
                </label>
                <input
                  id="question-count"
                  type="number"
                  min="1"
                  max="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of questions"
                />
              </div>
              <button
                type="submit"
                class="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Generate Test
              </button>
            </form>
          </div>
        </div>
      </div>
      <FloatingChat />
    </div>
  );
}
