"use client";
import { Head } from "$fresh/runtime.ts";
import GraphList from "../../islands/GraphList.tsx";

export default function GraphListPage() {
  return (
    <>
      <Head>
        <title>All Graphs - School Bud-E</title>
      </Head>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">All Graphs</h1>
        <GraphList key={Date.now()} />
      </div>
    </>
  );
} 