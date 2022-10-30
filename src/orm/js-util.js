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
