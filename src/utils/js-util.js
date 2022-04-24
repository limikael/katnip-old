export function arrayMove(array, initialIndex, finalIndex) {
	array.splice(finalIndex,0,array.splice(initialIndex,1)[0]);

	return array;
}

export async function delay(ms) {
	return new Promise((resolve, reject)=>{
		setTimeout(resolve,ms);
	});
}