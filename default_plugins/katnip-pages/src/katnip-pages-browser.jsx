import {katnip, convertToSlug, useChannel, A} from "katnip";
import PageView from "../components/PageView.jsx";
import PageAdmin from "../components/PageAdmin.jsx";
import FILE_EARMARK_TEXT from "bootstrap-icons/icons/file-earmark-text.svg";
import "./standard-elements.jsx";

function Box({inner, outer, children, color, label}) {
	return (
		<div {...outer} class="border p-3" style={{backgroundColor: color}}>
			I'm a box: {label}
			<div {...inner} class="border p-3 bg-body">
				{children}
			</div>
		</div>
	);
}

Box.controls={
	label: {},
	color: {}
}

Box.default=["hello"];

katnip.addElement(Box);

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Pages",
		href: "/admin/page",
		priority: 40,
		icon: FILE_EARMARK_TEXT
	});
});

katnip.addRoute("admin/page",PageAdmin);
katnip.addRoute("page/*",PageView);
