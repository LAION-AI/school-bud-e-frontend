import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { useEffect } from "preact/hooks";
import { chatSuffix } from "../../components/chat/store.ts";
import ChatIsland from "../../islands/ChatIsland.tsx";
export const handler: Handlers = {
    async GET(_, ctx) {
        return ctx.render(null);
    },
};

export default function ChatPage({ params }: PageProps) {
    const { id } = params;
    // Set the current chat suffix based on the route parameter so that ChatIsland displays the correct chat.
    useEffect(() => {
        chatSuffix.value = id;
    }, [id]);
    return (
        <>
            <Head>
                <title>Chat {id} - School Bud-E</title>
            </Head>
            <ChatIsland lang="en" />
        </>
    );
}
