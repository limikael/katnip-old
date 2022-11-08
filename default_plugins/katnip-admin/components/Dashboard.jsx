import {A} from "katnip";

export function Dashboard({request}) {
	return (
  <div class="px-4 py-5 text-center">
    <img class="d-block mx-auto mb-4" src="/cat.jpg" alt="" width="200" height="200"/>
    <h1 class="display-5 fw-bold">Katnip</h1>
    <div class="col-lg-6 mx-auto">
      <p class="lead mb-4">
        Like WordPress, but not quite...
      </p>
      <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <A href="/admin/customize" class="btn btn-primary btn-lg px-4 gap-3">Customize</A>
        <A href="/admin/page" class="btn btn-primary btn-lg px-4">Manage Content</A>
      </div>
    </div>
  </div>	
  );
}