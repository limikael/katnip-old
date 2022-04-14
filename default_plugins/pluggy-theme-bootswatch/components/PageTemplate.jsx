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
				href="https://cdn.jsdelivr.net/npm/bootswatch@5.1.3/dist/minty/bootstrap.min.css"
			/>
			<script
				src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
				async
			/>
			<div>
				<Nav/>
				<div class="container mt-3">
					{children}
				</div>
			</div>
		</>
	);
}
