import {katnip, lazyComponent} from "katnip";
import PageView from "../components/PageView.jsx";
import "./standard-elements.jsx";
import FILE_EARMARK_TEXT from "bootstrap-icons/icons/file-earmark-text.svg";

//import "../components/PageCounter.jsx";
//import "../components/Box.jsx";

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Pages",
		href: "/admin/page",
		priority: 40,
		icon: FILE_EARMARK_TEXT
	});
});

katnip.addRoute("admin/page",lazyComponent("admin","PageAdmin"));
katnip.addRoute("page/*",PageView);
