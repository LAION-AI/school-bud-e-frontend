import { useState } from "preact/hooks";

import { agreementContent } from "../internalization/content.ts";

interface ChatAgreementProps {
  lang: string;
}

export default function ChatAgreement({ lang }: ChatAgreementProps) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    localStorage.setItem("school-bud-e-agreement", "true");
    globalThis.location.reload();
  };

//   title: "Welcome to School Bud-E!",
//   content:
//     "Please read and accept the following terms and conditions to continue using School Bud-E.",
//   accept: "Accept",
//   terms: "Terms and Conditions",
//   temsAndConditionsContent: "Placeholder Terms and Conditions",

  return (
    <div class="w-full max-w-xl p-6 bg-white/50 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4">{agreementContent[lang].title}</h2>
        <p class="mb-4">{agreementContent[lang].content}</p>
        <p class="mb-4">
            <a href="#" class="underline">
                {agreementContent[lang].terms}
            </a>
        </p>
        <h3 class="text-lg font-bold mb-4">{agreementContent[lang].termsAndConditionsTitle}</h3>
        <p class="mb-4">{agreementContent[lang].temsAndConditionsContent}</p>
      <div class="mb-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed((e.target as HTMLInputElement).checked)}
            class="mr-2"
          />
          <span>{agreementContent[lang].agree}</span>
        </label>
      </div>
      <button
        onClick={handleAgree}
        disabled={!agreed}
        class={`w-full p-2 rounded ${
          agreed ? "bg-blue-500 text-white" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {agreementContent[lang].accept}
      </button>
    </div>
  );
}
