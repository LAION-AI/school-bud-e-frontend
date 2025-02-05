import { JSX } from "preact/jsx-runtime";
import { headerContent } from "../internalization/content.ts";
import { useState } from "preact/hooks";
import Menu from "./Menu.tsx";
import { ProfileDropdown } from "../components/core/ProfileDropdown.tsx";

/**
 * Header Component
 *
 * This component renders the header section of the application, which includes:
 * - A navigation menu
 * - A logo image
 * - Titles based on the selected language
 *
 * @param {Object} props - The properties object.
 * @param {string} props.lang - The language code for content localization.
 *
 * @returns {JSX.Element} The rendered header component.
 */
function Header({ lang }: { lang: string }): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header class="flex justify-between items-center text-black w-full bg-savanna border-b">
      <a class="flex items-center px-2 ml-2 my-1 gap-2 hover:bg-black hover:bg-opacity-10 rounded-md" href="/">
        {/* Logo Image */}
        <img
          src="/logo.png"
          width="50"
          height="50"
          alt="A little lion wearing a graduation cap."
        />

        <span class="font-semibold">
          {headerContent[lang]["title"]}
        </span>
      </a>
      {/* Render the navigation menu */}

      {/* Profile Icon */}
      <div class="relative px-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          class="flex items-center justify-center w-8 h-8 rounded-full border bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
        <ProfileDropdown isOpen={isOpen}>
          <Menu lang={lang} />
        </ProfileDropdown>
      </div>
    </header>
  );
}

export default Header;
