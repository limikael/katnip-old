function Nav() {
	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-primary">
			<div className="container-fluid">
				<a className="navbar-brand" href="#">Hello...</a>
			</div>
		</nav>
	);
}

export default function PageTemplate({children}) {
	return (
		<>
			<link 
				rel="stylesheet" 
				href="/public/bootstrap-minty.min.css"
			/>
			<script
				src="/public/bootstrap.bundle.min.js"
				async
			/>
			<style global jsx>{`
				html, body, .page {
					height: 100%;
				}
			`}</style>
			<div class="page d-flex flex-column">
				<Nav/>
				<div class="container mt-3 flex-grow-1">
					{children}
				</div>
			</div>
		</>
	);
}
