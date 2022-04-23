export function arrayMove(array, initialIndex, finalIndex) {
	array.splice(finalIndex,0,array.splice(initialIndex,1)[0]);

	return array;
}