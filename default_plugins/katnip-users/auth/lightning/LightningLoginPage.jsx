import {katnip, useChannel, A, useTemplateContext, useQuest, useCurrentUser} from "katnip";
import Qrious from "qrious";
import {useMemo, useState} from "preact/compat";

function QrImg(props) {
	let daqr=useMemo(()=>{
		return new Qrious({
			value: props.value,
			size: props.size,
			level: props.level
		});
	},[props.value,props.size,props.level]);

	return (
		<img src={daqr.toDataURL()} style={props.style} class={props.class}/>
	);
}

export default function LightningLoginPage() {
	let tc=useTemplateContext();
	let code=useQuest("/api/lightningAuthCode");
	let user=useCurrentUser();
	let postloginpath=useChannel("postloginpath");
	let [linking, setLinking]=useState();

	if (user && user.authMethods["lightning"]) {
		if (linking)
			katnip.setLocation("/account");

		else
			katnip.setLocation(postloginpath);

		return;
	}

	let title="Lightning Login";
	if (user) {
		title="Link Lightning To Account";
		setLinking(true);
	}

	tc.setTitle(title);

	if (code===undefined)
		return <div class="spinner-border m-3"/>;

	let url="lightning:"+code;

	return (<>
		<div class="card border-primary mt-4">
			<div class="card-header">{title}</div>
			<div class="card-body">
				<p class="text-center mb-0">
					<a href={url}>
						<QrImg value={url}
								class="mb-2"
								style="width: 100%; max-width: 50vh"
								size="250" level="M"/>
					</a>
				</p>
				<p class="text-center mb-0">
					<A class="badge rounded-pill bg-primary text-light text-decoration-none mx-1"
							href="#"
							copyOnClick={code}>
						Copy Code
					</A>
					<a class="badge rounded-pill bg-primary text-light text-decoration-none mx-1"
							href={url}>
						Open
					</a>
				</p>
			</div>
			<div class="card-body bg-dark text-light">
				<p class="text-center mb-0" style="font-family: monospace;">
					{code}
				</p>
			</div>
		</div>
	</>);
}