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
    <header class="flex flex-col justify-between items-center my-6 w-full px-4">
      {/* Render the navigation menu */}
      <Menu lang={lang} />

      <div class="flex items-center align-middle px-4 drop-shadow-2xl rounded-md">
        {/* Logo Image */}
        <img
          src="/logo.png"
          width="128"
          height="128"
          alt="A little lion wearing a graduation cap."
        />

        <div class="flex flex-col">
          {/* Over Title */}
          <h2 class="text-gray-600 font-semibold tracking-widest italic">
            {headerContent[lang]["overTitle"]}
          </h2>

          {/* Main Title */}
          <h1 class="text-4xl text-gray-600 font-semibold block self-center">
            {headerContent[lang]["title"]}
          </h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
