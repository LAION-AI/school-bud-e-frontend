import { warningContent } from "../internalization/content.ts";

function Warning({ lang }: { lang: string }) {
  const formatBoldTextWhereDoubleAsterisk = (text: string) => {
    const parts = text.split('**');
    return parts.reduce((acc, part, i) => {
      return i % 2 === 0 ? acc + part : acc + `<strong>${part}</strong>`;
    }, '');
  };

  return (
    <div
      class="bg-yellow-200/75 border-l-4 border-yellow-500 rounded-md text-yellow-700 p-4 mb-24"
      role="alert"
    >
      <p class="font-bold">{warningContent[lang]["title"]}</p>
      <p>
        {warningContent[lang]["content"]}
      </p>
      <p 
        class="whitespace-pre-line mt-4"
        dangerouslySetInnerHTML={{ 
          __html: formatBoldTextWhereDoubleAsterisk(warningContent[lang]["usage"]) 
        }}
      />
    </div>
  );
}

export default Warning;
