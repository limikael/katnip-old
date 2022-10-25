export function parseCookieString(str) {
	const list = {};

	if (!str) return list;

	str.split(`;`).forEach(function(cookie) {
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

export function decodeQueryString(qs) {
	if (qs===undefined)
		qs="";

	let o={};
	for (let component of qs.split("&")) {
		let [key, value]=component.split("=");

		if (key)
			o[key]=decodeURIComponent(value);
	}

	return o;
}

export function buildUrl(url, vars={}) {
	if (!url)
		url="";

	let [base,queryString]=url.split("?");
	let query=decodeQueryString(queryString);
	Object.assign(query,vars);

	//console.log("q: "+JSON.stringify(query));
	const ordered=Object.keys(query).sort().reduce((obj, key)=>{
		if (query[key]!==undefined)
			obj[key]=query[key]; 

		return obj;
	},{});

	//console.log("ordered: "+JSON.stringify(ordered));

	for (let key in ordered) {
		let sep=(base.indexOf('?')>-1)?'&':'?';
		base=base+sep+key+'='+encodeURIComponent(ordered[key]);
	}

	return base;
}

export async function apiFetch(url, query={}, options={}) {
	let	headers={
		"Content-Type": "application/json"
	};

	headers={...headers,...options.headers};

	let response=await fetch(url,{
		method: "POST",
		headers: headers,
		cache: "no-cache",
		body: JSON.stringify(query)
	});
	let text=await response.text();
	let data;

	try {
		data=JSON.parse(text);
	}

	catch (e) {
		throw new Error(text);
	}

	if (response.status!=200) {
		if (data && data.message) {
			let e=new Error(data.message);

			for (let k in data)
				e[k]=data[k];

			throw e;
		}

		throw new Error(text);
	}

	return data;
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

export function arrayMove(array, initialIndex, finalIndex, num=1) {
	array.splice(finalIndex,0,...array.splice(initialIndex,num));

	return array;
}

export function arrayRemove(array, item) {
	let idx=array.indexOf(item);
	if (idx<0)
		return;

	array.splice(idx,1);
}

export function arrayEqualsShallow(a, b) {
	return ((Array.isArray(a) && Array.isArray(b)) &&
		a.length === b.length &&
		a.every((dep, idx) => Object.is(dep, b[idx]))
	);
}

export function bindArgs(fn, ...args) {
	return fn.bind(null,...args);
}

export function setLocation(url, options={}) {
	if (window.location.origin!=new URL(url,window.location.origin).origin) {
		window.location=url;
		return;
	}

	if (!options.hasOwnProperty(event))
		options.event="locationchange";

	if (!url)
		url="/";

	if (options.replace)
		history.replaceState(null,null,url);

	else
		history.pushState(null,null,url);

	if (options.event)
		window.dispatchEvent(new Event(options.event));
}

export function objectFirstKey(o) {
	return Object.keys(o)[0];
}

export function objectMap(o, fn) {
	let res=[];
	for (let k in o)
		res.push(fn(o[k],k))

	return res;
}

export function withTargetValue(fn) {
	return (ev)=>{
		fn(ev.target.value);
	}
}

export function waitEvent(o, success, fail) {
	return new Promise((resolve, reject)=>{
		o.once(success,()=>{
			resolve();
		});

		o.once("error",(e)=>{
			reject(e);
		});
	});
}

export function validateFormData(formData, spec) {

}