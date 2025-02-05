import { effect } from "https://esm.sh/@preact/signals-core@1.8.0/dist/signals-core.js";
import { signal } from "https://esm.sh/@preact/signals-core@1.8.0/dist/signals-core.js";

let initialSuffix =  "0"
if (typeof window !== "undefined") {
  initialSuffix = new URL(window.location.href).searchParams.get("chat") ||
    "0";
}
export const chatSuffix = signal(initialSuffix);

effect(() => {
  const suffix = chatSuffix.value;
  console.log("chatsuffix", chatSuffix)
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href)
    url.searchParams.set("chat", suffix);
    window.location.href.replace(url.toString());
  }
});