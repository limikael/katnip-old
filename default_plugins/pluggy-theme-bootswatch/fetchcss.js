let allThemes=["cerulean", "cosmo", "cyborg", "darkly", "flatly",
	"journal", "litera", "lumen", "lux", "materia",
	"minty", "morph", "pulse", "quartz", "sandstone",
	"simplex", "sketchy", "slate", "solar", "spacelab",
	"superhero", "united", "vapor", "yeti", "zephyr"
]

for (let theme of allThemes) {
	let url=`https://cdn.jsdelivr.net/npm/bootswatch@5.1.3/dist/${theme}/bootstrap.min.css`
	let out="public/bootstrap-"+theme+".min.css";

	console.log(`curl -o ${out} ${url}`);
}
