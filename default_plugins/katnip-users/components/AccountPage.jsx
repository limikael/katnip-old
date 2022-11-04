import {katnip, PromiseButton, useCurrentUser, setTemplateContext} from "katnip";
import AuthenticationTab from "./AuthenticationTab.jsx";
import IdentificationTab from "./IdentificationTab.jsx";

function AccordionItem({id, parent, children, show, title}) {
	return (
		<div class="accordion-item">
			<h2 class="accordion-header"
					id={`heading-${id}`}>
				<button class={`accordion-button ${show?"":"collapsed"}`}
						type="button" 
						data-bs-toggle="collapse" 
						data-bs-target={`#collapse-${id}`} 
						aria-expanded="true" 
						aria-controls={`collapse-${id}`}>
					{title}
				</button>
			</h2>
			<div id={`collapse-${id}`}
					class={`accordion-collapse collapse ${show?"show":""}`}
					aria-labelledby={`heading-${id}`} 
					data-bs-parent={`#${parent}`}>
				<div class="accordion-body">
					<div>{children}</div>
				</div>
			</div>
		</div>
	);
}

export default function AccountPage({renderMode}) {
	if (renderMode=="ssr")
		return;

	let user=useCurrentUser();

	console.log("account page, renderMode="+renderMode);

	if (!user) {
		console.log("no user, redirecting");
		katnip.setLocation("/login");
		return;
	}

	setTemplateContext({title: "Account"});

	let accountTabs=[];
	accountTabs.push({
		title: "Identification",
		component: IdentificationTab,
		priority: 10
	});
	accountTabs.push({
		title: "Authentication",
		component: AuthenticationTab,
		priority: 50
	});

	katnip.doAction("getAccountTabs",accountTabs,user);
	accountTabs.sort((a,b)=>a.priority-b.priority);

	let accordionItems=[];
	for (let i=0; i<accountTabs.length; i++) {
		let accountTab=accountTabs[i];
		accordionItems.push(
			<AccordionItem id={`tab-${i}`}
					title={accountTab.title}
					parent="account-accordion" show={!i}
					key={i}>
				<accountTab.component />
			</AccordionItem>
		);
	}

	async function onLogoutClick() {
		await katnip.apiFetch("/api/logout");
	}

	function onLogoutError(e) {
		console.log(e);
	}

	return (<>
		<div class="accordion mb-3" id="account-accordion" style="max-width: 40rem">
			{accordionItems}
		</div>
		<PromiseButton class="btn btn-primary" onclick={onLogoutClick} onerror={onLogoutError}>
			Log out
		</PromiseButton>
	</>);
}