function GridContainer({children, ...props}) {
	let style={
		display: "grid",
		height: "100%",
		"grid-template-columns": "25% 50% 25%",
		"grid-template-rows": "10% auto 10%"
	};

	return <div style={style}>{children}</div>
}

function GridItem({children, ...props}) {
	let style={
		"grid-area": props.area,
		...props.style
	};

	return <div style={style} class={props.class}>{children}</div>
}

// 		<PageEditHead />

export default function PageEdit({request}) {
	return (
		<div style="width: 100%; height: calc( 100% - 40px )">
			<GridContainer>
				<GridItem class="bg-light p-3 border-bottom" area="1 / 1 / span 1 / span 3">
					Hello
				</GridItem>
				<GridItem area="2 / 1 / span 1 / span 1" class="bg-light border-end">hello</GridItem>
				<GridItem area="2 / 2 / span 1 / span 1">hello</GridItem>
				<GridItem area="2 / 3 / span 1 / span 1" class="bg-light border-start">hello</GridItem>
				<GridItem class="bg-light border-top px-3" area="3 / 1 / span 1 / span 3">
					Page &gt; Paragraph
				</GridItem>
			</GridContainer>
		</div>
	);
}