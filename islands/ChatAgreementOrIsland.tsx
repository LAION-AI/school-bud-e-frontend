import ChatAgreement from "./ChatAgreement.tsx";
import ChatIsland from "./ChatIsland.tsx";

interface ChatAgreementOrIslandProps {
  lang: string;
}

export default function ChatAgreementOrIsland(
  { lang }: ChatAgreementOrIslandProps,
) {
  const hasAgreed = localStorage.getItem("school-bud-e-agreement") === "true";
  return (
    <>
      {hasAgreed
        ? (
          <>
            <ChatIsland lang={lang} />
          </>
        )
        : <ChatAgreement lang={lang} />}
    </>
  );
}
