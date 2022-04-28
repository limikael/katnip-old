export function parseCookies(request) {
	const list = {};
	const cookieHeader = request.headers?.cookie;
	if (!cookieHeader) return list;

	cookieHeader.split(`;`).forEach(function(cookie) {
		let [ name, ...rest] = cookie.split(`=`);
		name = name?.trim();
		if (!name) return;
		const value = rest.join(`=`).trim();
		if (!value) return;
		list[name] = decodeURIComponent(value);
	});

	return list;
}

export function	isServer() {
	return (typeof global!=="undefined");
}

export function isClient() {
	return (typeof window!=="undefined");
}

export function buildUrl(base, vars) {
	for (let key in vars) {
		value=vars[key];
		let sep = (base.indexOf('?') > -1) ? '&' : '?';
		base=base+sep+key+'='+encodeURIComponent(value);
	}

	return base

}

export async function apiFetch(url, query={}) {
//	url=buildUrl(url,query);

	let response=await fetch(url,{
		method: "POST",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(query)
	});
	let text=await response.text();
	let data=JSON.parse(text);

	if (response.status!=200) {
		if (data && data.message)
			throw new Error(data.message);

		throw new Error(text);
	}

	return data;
}

export function parseRequest(url) {
	let l=new URL(url,window.location.origin);
	let query=Object.fromEntries(new URLSearchParams(l.search));
	let params=l.pathname.split("/").filter(s=>s.length>0);
	let path="/"+params.join("/");

	return {
		params,
		path,
		query,
		href: l.href
	};
}

export function	getCurrentRequest() {
	return parseRequest(window.location);
}

export function quoteAttr(s, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only 
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */ 
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
        ;
}

export function delay(millis) {
	return new Promise((resolve,reject)=>{
		setTimeout(resolve,millis);
	});
}

export function arrayMove(array, initialIndex, finalIndex) {
	array.splice(finalIndex,0,array.splice(initialIndex,1)[0]);

	return array;
}

export function bindArgs(fn, ...args) {
	return fn.bind(null,...args);
}

export function setLocation(url, options={}) {
	if (!options.hasOwnProperty(event))
		options.event="locationchange";

	if (options.replace)
		history.replaceState(null,null,url);

	else
		history.pushState(null,null,url);

	if (options.event)
		window.dispatchEvent(new Event(options.event));
}
