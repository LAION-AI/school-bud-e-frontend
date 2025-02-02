import { JSX } from "preact/jsx-runtime";
import { headerContent } from "../internalization/content.ts";
import Menu from "./Menu.tsx";

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
  return (
    <header class="flex justify-between items-center text-black w-full bg-savanna border-b-2 border-black">
      <div class="flex items-center px-4 py-1 gap-2">
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
      </div>
      {/* Render the navigation menu */}
      <Menu lang={lang} />

    </header>
  );
}

export default Header;
