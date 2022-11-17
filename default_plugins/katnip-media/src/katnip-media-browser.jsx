import {katnip, lazyComponent} from "katnip";
import IMAGES from "bootstrap-icons/icons/images.svg";

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Media",
		href: "/admin/media",
		priority: 35,
		icon: IMAGES
	});
});

katnip.addRoute("admin/media",lazyComponent("admin","MediaAdmin"));