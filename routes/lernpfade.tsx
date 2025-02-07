import { JSX } from "preact";
import { Head } from "$fresh/runtime.ts";
import Header from "../islands/Header.tsx";
import LearningPathsGraph from "../islands/LearningPathsGraph.tsx";

export default function Lernpfade(props: { params: { lang: string } }): JSX.Element {
  const lang = props.params.lang || "en";

  return (
    <>
      <Head>
        <title>Learning Paths - School Bud-E</title>
      </Head>
      <Header lang={lang} />
      <LearningPathsGraph lang={lang} />
    </>
  );
}