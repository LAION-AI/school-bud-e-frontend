import type { JSX } from "preact";
import { UserProfile } from "../islands/UserProfile.tsx";

export default function Profile(): JSX.Element {
	return (
		<div class="container mx-auto py-8">
			<UserProfile lang="en" />
		</div>
	);
}
