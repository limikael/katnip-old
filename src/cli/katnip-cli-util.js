export function formatTable(objects) {
	let rep=(s,n)=>Array(n).fill(s).join("");

	let colNames=[];
	let colWidths=[];

	for (let object of objects) {
		for (let k in object)
			if (!colNames.includes(k))
				colNames.push(k);
	}

	for (let object of objects) {
		for (let k in object) {
			let colIndex=colNames.indexOf(k);
			if (object[k] && (
					!colWidths[colIndex] || object[k].length>colWidths[colIndex]))
				colWidths[colIndex]=object[k].length;
		}
	}

	console.log("+-"+colWidths.map(n=>rep("-",n)).join("-+-")+"-+");
	console.log("| "+colNames.map((s,i)=>s+rep(" ",colWidths[i]-s.length)).join(" | ")+" |");
	console.log("+-"+colWidths.map(n=>rep("-",n)).join("-+-")+"-+");

	for (let object of objects) {
		console.log("| "+colNames.map((k,i)=>{
			let s=object[k];
			if (!s)
				s="";

			return s+rep(" ",colWidths[i]-s.length);
		}).join(" | ")+" |");
	}

	console.log("+-"+colWidths.map(n=>rep("-",n)).join("-+-")+"-+");
}