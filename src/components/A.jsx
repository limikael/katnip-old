import {setLocation} from "katnip";
import {forwardRef} from "react";

/**
 * Client side transitions.
 *
 * The A component (with capital A) does the same thing as the normal
 * HTML anchor tag. The difference is that for local links, the transition
 * will all happen on the client side. I.e., rather than reloading the
 * page and all resources on the page, the component responsible for 
 * rendering the new location will be called.
 * All props accepted by the normal a tag can be passwd to A as well,
 * and will have the same behaviour.
 *
 * @component React Components.A
 * @param href:String The url to navigate to. If href is a relative url
 *                    no reload will happen.
 */
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
