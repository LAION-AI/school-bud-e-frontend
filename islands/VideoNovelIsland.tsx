import FloatingChat from "../components/chat/FloatingChat.tsx";
import VideoNovelComponent from "../components/video-novel/index.tsx";

interface VideoNovelIslandProps {
  lang: string;
}

export default function VideoNovelIsland(
  { lang }: VideoNovelIslandProps,
) {
  return (
    <>
      <VideoNovelComponent lang={lang} />
      <FloatingChat />
    </>
  );
}
