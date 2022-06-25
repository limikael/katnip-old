import {catnip, useChannel, A, useTemplateContext, useApiFetch, useCurrentUser} from "catnip";
import Qrious from "qrious";
import {useMemo} from "preact/compat";

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
	let code=useApiFetch("/api/lightningAuthCode");
	let user=useCurrentUser();
	let postloginpath=useChannel("postloginpath");

	if (user) {
		catnip.setLocation(postloginpath);
		return;
	}

	tc.setTitle("Lightning Login");

	if (code===undefined)
		return <div class="spinner-border m-3"/>;

	let url="lightning:"+code;

	return (<>
		<div class="card border-primary mt-4">
			<div class="card-header">Lightning Login</div>
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