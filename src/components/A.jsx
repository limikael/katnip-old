import {setLocation} from "katnip";
import {forwardRef} from "react";

export const A=forwardRef(({children, ...props}, ref)=>{
	function onClick(ev) {
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
