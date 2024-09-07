import { menuContent } from "../internalization/content.ts";

export default function Menu({ lang }: { lang: string }) {
  const menuItems = [
    { name: menuContent[lang]["about"], href: "/about?lang=" + lang },
    { name: menuContent[lang]["imprint"], href: "https://laion.ai/impressum" },
  ];

  const languages = [
    { name: "Deutsch", code: "de", symbol: "🇩🇪" },
    { name: "English", code: "en", symbol: "🇬🇧" },
  ];

  return (
    <div class="absolute flex text-xs space-x-4 top-0 right-0 left-0 m-4 justify-end">
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
