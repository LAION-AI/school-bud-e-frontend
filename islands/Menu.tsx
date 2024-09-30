import { JSX } from "preact/jsx-runtime";
import { menuContent } from "../internalization/content.ts";

/**
 * Menu Component
 * 
 * This component renders the navigation menu and language selector for the application.
 * 
 * @param {Object} props - The properties object.
 * @param {string} props.lang - The language code for content localization.
 * 
 * @returns {JSX.Element} The rendered menu component.
 */
export default function Menu({ lang }: { lang: string }): JSX.Element {
  // Define menu items with localized names and URLs
  const menuItems = [
    { name: menuContent[lang]["about"], href: "/about?lang=" + lang },
    { name: menuContent[lang]["imprint"], href: "https://laion.ai/impressum" },
  ];

  // Define available languages with their codes and symbols
  const languages = [
    { name: "Deutsch", code: "de", symbol: "🇩🇪" },
    { name: "English", code: "en", symbol: "🇬🇧" },
  ];

  return (
    <div class="absolute flex text-xs space-x-4 top-0 right-0 left-0 m-4 justify-end">
      {/* Language Selector */}
      <select
        class="bg-transparent"
        onChange={(e) =>
          globalThis.location = (e.target as HTMLInputElement)
            .value as unknown as Location}
      >
        {languages.map((language) => (
          <option
            selected={lang === language.code ? true : false}
            value={`/?lang=` + language.code}
          >
            {language.symbol}
          </option>
        ))}
      </select>
      
      {/* Menu Items */}
      {menuItems.map((item) => (
        <a
          href={item.href}
          class="text-gray-600 hover:text-gray-800 hover:drop-shadow-md self-end"
        >
          {item.name}
        </a>
      ))}
    </div>
  );
}