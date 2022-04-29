import {ItemForm, apiFetch, useSession} from "catnip";

export default function Settings({request}) {
	let [session, setSession]=useSession();

	async function read() {
		return {
			sitename: session.sitename,
			homepath: session.homepath
		}
	}

	async function write(values) {
		await apiFetch("/api/saveSettings",values);
		setSession(values);

		return "Settings saved...";
	}

	return (<>
		<h1 class="mb-3">Settings</h1>
		<ItemForm
				style="max-width: 40rem"
				item={read}
				save={write}
				deps={[]}>
			<div class="container border rounded p-3 bg-light">
				<div class="mb-3">
					<label class="form-label">Site Name</label>
					<ItemForm.Input
							name="sitename"
							type="text"
							class="form-control"/>
				</div>
				<div class="mb-3">
					<label class="form-label">Homepage Route</label>
					<ItemForm.Input
							name="homepath"
							type="text"
							class="form-control"/>
				</div>
				<ItemForm.Submit class="btn btn-primary">
					Save Settings
				</ItemForm.Submit>
			</div>
		</ItemForm>
	</>);
}