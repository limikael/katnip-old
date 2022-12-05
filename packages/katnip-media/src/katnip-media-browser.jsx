import {katnip, lazyComponent, useModal, useApiFetch, bsLoader, A, bindArgs} from "katnip";
import {MediaSelect} from "../components/MediaSelect.jsx";
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

function MediaImage({mediaId, outer, ...props}) {
	let src="";
	if (mediaId)
		src="/"+mediaId;

	return (
		<img {...outer} src={src} class={props.class} style={props.style}/>
	);
}

MediaImage.wrap=false;
MediaImage.controls={
	mediaId: {title: "Media", type: MediaSelect},
	class: {type: "textarea"},
	style: {type: "textarea"}
}

katnip.addElement("MediaImage",MediaImage)