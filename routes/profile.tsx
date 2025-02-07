import { JSX } from "preact";
import { UserProfile } from "../islands/UserProfile.tsx";
import Header from "../islands/Header.tsx";

export default function Profile(): JSX.Element {
    return (
        <>
            <Header lang="en" />
            <div class="container mx-auto py-8">
                <UserProfile lang="en" />
            </div>
        </>
    );
}