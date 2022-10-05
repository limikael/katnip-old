import {setLocation} from "katnip";
import {forwardRef} from "react";

export const A=forwardRef(({children, ...props}, ref)=>{
	function onClick(ev) {
		if (props.onclick) {
			if (props.onclick(ev)===false)
				ev.preventDefault();
		}

		if (ev.defaultPrevented)
			return;

		ev.preventDefault();

		if (props.copyOnClick) {
			navigator.clipboard.writeText(props.copyOnClick);
			return;
		}

		setLocation(props.href);
	}

	return (
		<a {...props} onclick={onClick} ref={ref}>
			{children}
		</a>
	);
});
