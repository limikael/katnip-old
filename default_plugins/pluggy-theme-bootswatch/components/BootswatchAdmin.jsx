export default function BootswatchAdmin() {
	return (
		<>
			<h1>Bootswatch</h1>
			<form>
				<fieldset>
					<div class="form-group mb-3">
						<label class="form-label">Email</label>
						<select class="form-select">
							<option>1</option>
							<option>2</option>
							<option>3</option>
							<option>4</option>
							<option>5</option>
						</select>
					</div>
					<button type="submit" class="btn btn-primary">Save Settings</button>
				</fieldset>
			</form>
		</>
	);
}
