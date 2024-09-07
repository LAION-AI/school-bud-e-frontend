import Menu from "./Menu.tsx";
import { headerContent } from "../internalization/content.ts";

function Header({ lang }: { lang: string }) {
  return (
    <header class="flex flex-col justify-between items-center my-6 w-full px-4">
      <Menu lang={lang} />
      <div class="flex items-center align-middle px-4 drop-shadow-2xl rounded-md">
        <img
          src="/logo.png"
          width="128"
          height="128"
          alt="A little lion wearing a graduation cap."
        />
        <div class="flex flex-col">
          <h2 class="text-gray-600 font-semibold tracking-widest italic">
            {headerContent[lang]["overTitle"]}
          </h2>
          <h1 class="text-4xl text-gray-600 font-semibold block self-center">
            {headerContent[lang]["title"]}
          </h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
