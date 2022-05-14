import {catnip} from "catnip";
import ChangePasswordTab from "./ChangePasswordTab.jsx";
import ChangeEmailTab from "./ChangeEmailTab.jsx";
import DeleteAccountTab from "./DeleteAccountTab.jsx";

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

export default function AccountPage() {
	let tc=catnip.useTemplateContext();
	tc.setTitle("Account");

	let accountTabs=[];
	accountTabs.push({
		title: "Change Password",
		component: ChangePasswordTab,
		priority: 10,
	});

	accountTabs.push({
		title: "Change Email",
		component: ChangeEmailTab,
		priority: 20,
	});

	accountTabs.push({
		title: "Delete Account",
		component: DeleteAccountTab,
		priority: 30,
	});

	catnip.doAction("getAccountTabs",accountTabs);
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

	return (
		<div class="accordion" id="account-accordion" style="max-width: 40rem">
			{accordionItems}
		</div>
	);
}