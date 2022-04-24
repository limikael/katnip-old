import pluggy from "pluggy";
import {PageTemplate} from "./components.jsx";

pluggy.addAction("getMenuLocations",(items)=>{
	items.push({
		title: "Header Menu",
		setting: "menuHeader"
	});

	items.push({
		title: "Footer Menu",
		setting: "menuFooter"
	});
})

pluggy.addAction("getPageTemplate",(request)=>{
	if (request.params[0]!="admin")
		return PageTemplate;
});

pluggy.addAction("getClientSession",async (clientSession)=>{
	clientSession.menuHeader=pluggy.getSetting("menuHeader");
});
