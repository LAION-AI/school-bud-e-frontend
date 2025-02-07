import Header from "../islands/Header.tsx";
import ChatAgreementOrIsland from "../islands/ChatAgreementOrIsland.tsx";

export default function Home(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") as string !== undefined &&
    url.searchParams.get("lang") !== null
    ? url.searchParams.get("lang")
    : "de";

  return (
    <>
      <Header lang={lang} />
      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Chat Area */}
        <div class="flex-1 flex flex-col overflow-hidden h-[calc(100vh-64px)]">
          {/* <Header lang={lang as string} /> */}
          <div
            class="flex-1 overflow-auto h-[calc(100vh-64px)]"
            style={{
              backgroundImage: "url('/lines.svg')",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <ChatAgreementOrIsland lang={lang as string} />
          </div>
        </div>
      </div>
    </>
  );
}
