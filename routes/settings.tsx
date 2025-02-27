import { JSX } from "preact";
import Settings from "../components/Settings.tsx";

export default function SettingsPage(): JSX.Element {
  return (
    <div class="container mx-auto py-8 px-4 max-w-5xl">
      <h1 class="text-3xl font-bold mb-6">Settings</h1>
      <div class="bg-white rounded-lg shadow-lg p-6">
        <Settings onClose={() => {}} lang="en" /> {/* onClose is a no-op here since we're on a dedicated page */}
      </div>
    </div>
  );
} 