/**
 * Various JavaScript functions.
 * @section JavaScript Functions
 */
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

/**
 * Append query variables to url.
 *
 * The buildUrl function adds all query variables in the vars array to the url.
 * If a specified variable already exists as a query variable, it will be
 * overwritten. The query variables will be url encoded.
 *
 * @function JavaScript Functions.buildUrl
 * @param url:String The url.
 * @param vars:Object Variables to append to the url.
 */
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

/**
 * Wrapper for the standard fetch call.
 *
 * @function JavaScript Functions.fetchEx
 * @param url:String The url to fetch.
 * @param options:Object Options.
 */
export async function fetchEx(url, options={}) {
	let headers={...options.headers};

	let haveFile=false;
	if (options.query)
		for (let k in options.query)
			if (options.query[k] instanceof File)
				haveFile=true;

	let body=JSON.stringify(options.query);
	if (haveFile) {
		body=new FormData();
		for (let k in options.query)
			body.append(k,options.query[k]);
	}

	else {
		if (!headers["Content-Type"])
			headers["Content-Type"]="application/json";
	}

	let response=await fetch(url,{
		method: "POST",
		headers: headers,
		cache: "no-cache",
		body: body
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

	if (options.processResult) {
		data=options.processResult(data,response);
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

/**
 * Set current browser location.
 *
 * This function sets the current location as specified in the url parameter.
 * You can think of this function as loading a new page in the browser, with
 * the exception that the page will not actually be reloaded. Instead, the
 * page will be re-rendered with the appropriate route handler. The history
 * state in the browser will be updated so that the back and forward buttons
 * will work as expected. This function is only available on the client.
 *
 * @function Client Functions.setLocation
 * @param url:String The new browser location.
 */
export function setLocation(url, options={}) {
	if (typeof window=="undefined")
		return;

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

export function waitEvent(o, success, fail="error") {
	return new Promise((resolve, reject)=>{
		if (o.once) {
			o.once(success,()=>{
				resolve();
			});

			o.once("error",(e)=>{
				reject(e);
			});
		}

		else if (o.addEventListener) {
			function listener() {
				o.removeEventListener(success,listener);
				resolve();
			}

			o.addEventListener(success,listener);
		}

		else {
			reject(new Error("Not an event dispatcher"));
		}
	});
}

export async function retry(fn, options) {
	if (!options.times)
		options.times=5;

	if (!options.delay)
		options.delay=5000;

	let tries=0;
	while (tries<options.times) {
		if (tries)
			await delay(options.delay);

		try {
			let res=await fn()
			return res;
		}

		catch (e) {
			if (options.onerror)
				options.onerror(e);

			tries++;
		}
	}
}

export function delay(millis) {
	return new Promise((resolve,reject)=>{
		setTimeout(resolve,millis);
	});
}
