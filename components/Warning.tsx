import { warningContent } from "../internalization/content.ts";

function Warning({ lang }: { lang: string }) {
  return (
    <div
      class="bg-yellow-200/75 border-l-4 border-yellow-500 rounded-md text-yellow-700 p-4 mb-24"
      role="alert"
    >
      <p class="font-bold">{warningContent[lang]["title"]}</p>
      <p>
        {warningContent[lang]["content"]}
      </p>
    </div>
  );
}

export default Warning;
