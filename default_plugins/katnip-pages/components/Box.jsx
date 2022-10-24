import {addElement} from "katnip";

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

Box.wrap=false;
Box.controls={
	label: {},
	color: {}
}

addElement("Box",Box);
