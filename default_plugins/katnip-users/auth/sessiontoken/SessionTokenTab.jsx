import {useCurrentUser} from "katnip";

export default function SessionTokenTab() {
	let u=useCurrentUser();

	return <>
		<p>
			This is your session token. It is stored in a cookie in this browser. Keep it safe,
			so  you can use it to log in from another browser.
		</p>
		<div class="card bg-light">
			<div class="card-body font-monospace">
				{u.token}
			</div>
		</div>
	</>;
}
