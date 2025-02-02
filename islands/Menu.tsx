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
    <div class="">
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
          class="hover:text-gray-900 hover:drop-shadow-md self-end px-2"
        >
          {item.name}
        </a>
      ))}
    </div>
  );
}
