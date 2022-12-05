import {A, ItemList, apiFetch, usePromise, PromiseButton, delay, bindArgs, bsLoader} from "katnip";
import dayjs from "dayjs";

export function PackageList({installed, oninstall, keyword}) {
	let pluginData=usePromise(async()=>{
		let request=await fetch("https://registry.npmjs.com/-/v1/search?text=keywords:"+keyword);
		let result=await request.json();
		result.installed=await installed();

		return result;
	});

	return bsLoader(pluginData,()=>{
		//console.log(pluginData);
		return pluginData.objects.map((o)=><>
			<div class="border-bottom d-flex flex-row">
				<div class="flex-grow-1">
					<h5 class="mt-3">{o.package.name}</h5>
					<p class="text-muted mb-2">{o.package.description}</p>
					<p class="text-muted">
						<b>{o.package.publisher.username}</b>
						<span class="mx-2">published {o.package.version}</span>
						&bull;<span class="mx-2">{dayjs(o.package.date).from(dayjs())}</span>
					</p>
				</div>
				<div>
					{pluginData.installed.includes(o.package.name) && 
						<button class="btn btn-outline-primary mt-3" disabled={true}>
							Installed
						</button>
					}
					{!pluginData.installed.includes(o.package.name) && 
						<PromiseButton class="btn btn-primary mt-3" onclick={bindArgs(oninstall,o.package.name)}>
							Install
						</PromiseButton>
					}
				</div>
			</div>
		</>);
	});
}
