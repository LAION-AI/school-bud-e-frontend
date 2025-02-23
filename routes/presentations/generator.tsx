import { Head } from "$fresh/runtime.ts";
import PresentationGeneratorIsland from "../../islands/PresentationGeneratorIsland.tsx";

export default function PresentationGeneratorPage() {
  return (
    <>
      <Head>
        <title>Presentation Generator</title>
      </Head>
      <div class="h-full">
        <PresentationGeneratorIsland />
      </div>
    </>
  );
}
