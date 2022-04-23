import {pluggy, AdminMessages, A} from "pluggy";
import {useState} from "preact/compat";
import TRASH_ICON from "bootstrap-icons/icons/x-lg.svg";
import ARROW_UP from "bootstrap-icons/icons/caret-up-fill.svg";
import ARROW_DOWN from "bootstrap-icons/icons/caret-down-fill.svg";

const filterDanger="filter: invert(26%) sepia(100%) saturate(1559%) hue-rotate(331deg) brightness(91%) contrast(93%); ";
const filterPrimay="filter: invert(26%) sepia(100%) saturate(1970%) hue-rotate(208deg) brightness(100%) contrast(99%); ";

export function MenuEditor({request}) {
	let [activeIndex,setActiveIndex]=useState(-1);
	let [menus,setMenus]=useState([]);

	let url;
	if (request.query.setting)
		url=pluggy.buildUrl("/api/getMenu",{setting: request.query.setting});

	pluggy.useApiFetch(url,{
		complete: setMenus
	});

	let tabs=[];
	let menuLocations=[];
	pluggy.doAction("getMenuLocations",menuLocations);

	let menuTabs=[];
	for (let menuLocation of menuLocations) {
		let href=pluggy.buildUrl("/admin/menus",{
			setting: menuLocation.setting
		});

		let linkCls="nav-link ";
		if (menuLocation.setting==request.query.setting)
			linkCls+=" active";

		menuTabs.push(
			<li class="nav-item ">
				<A class={linkCls} href={href}>{menuLocation.title}</A>
			</li>
		);
	}

	if (!request.query.setting) {
		pluggy.setLocation(pluggy.buildUrl("/admin/menus",{
			setting: menuLocations[0].setting
		}));
		return;
	}

	let emptyIndex=-1;
	for (let index in menus) {
		let item=menus[index];
		if (!item.label  && index!=activeIndex)
			emptyIndex=index;
	}

	if (emptyIndex>=0) {
		menus.splice(emptyIndex,1);
		setMenus([...menus]);

		if (emptyIndex<activeIndex)
			setActiveIndex(activeIndex-1);
	}

	function onMenuChange(ev) {
		let field=ev.target.dataset.field;
		menus[activeIndex][field]=ev.target.value;

		setMenus([...menus]);
	}

	function onMenuHeaderClick(ev) {
		let index=ev.target.dataset.index;
		ev.preventDefault();

		if (index==activeIndex)
			setActiveIndex(-1);

		else
			setActiveIndex(index);
	}

	function onAddMenuClick() {
		let index=menus.length;
		menus.push({
			label: "",
			href: ""
		});

		setMenus([...menus]);
		setActiveIndex(index);
	}

	function onMenuDeleteClick(ev) {
		let index=parseInt(ev.target.closest("a").dataset.index);
		ev.preventDefault();

		menus.splice(index,1);
		setMenus([...menus]);
		setActiveIndex(-1);
	}

	function onMenuMoveUpClick(ev) {
		let index=parseInt(ev.target.closest("a").dataset.index);
		ev.preventDefault();
		if (index<=0)
			return;

		menus=pluggy.arrayMove(menus,index,index-1);
		setMenus([...menus]);
		setActiveIndex(index-1);
	}

	function onMenuMoveDownClick(ev) {
		let index=parseInt(ev.target.closest("a").dataset.index);
		ev.preventDefault();
		if (index>=menus.length-1)
			return;

		menus=pluggy.arrayMove(menus,index,index+1);
		setMenus([...menus]);
		setActiveIndex(index+1);
	}

	async function onSaveClick() {
		await pluggy.apiFetch("/api/saveMenu",{
			setting: request.setting,
			value: menus
		});
	}

	let menuViews=[];
	for (let menuIndex in menus) {
		let menu=menus[menuIndex];

		let cardClass="card mb-3 ";
		let cardBody;
		let cardStyle;
		let cardIcons;
		let labelLink="flex-grow-1 ";
		if (menuIndex==activeIndex) {
			cardClass+="shadow";
			cardBody=(
				<div class="card-body">
					<form class="mb-0">
						<div class="form-group row mb-3">
							<div class="col-4"><label class="col-form-label">Label</label></div>
							<div class="col-8">
								<input type="text" class="form-control" 
										value={menus[menuIndex].label}
										onchange={onMenuChange}
										data-field="label"/>
							</div>
						</div>
						<div class="form-group row">
							<div class="col-4"><label class="col-form-label">Link</label></div>
							<div class="col-8">
								<input type="text" class="form-control"
										value={menus[menuIndex].href}
										onchange={onMenuChange}
										data-field="href"/>
							</div>
						</div>
					</form>
				</div>
			);

			cardIcons=(<>
				<a href="#" onclick={onMenuMoveUpClick} data-index={menuIndex}>
					<img src={ARROW_UP} class="ms-2" style={filterPrimay+" height: 1.25em;"}/>
				</a>
				<a href="#" onclick={onMenuMoveDownClick} data-index={menuIndex}>
					<img src={ARROW_DOWN} class="ms-2" style={filterPrimay+" height: 1.25em;"}/>
				</a>
				<a href="#" onclick={onMenuDeleteClick} data-index={menuIndex}>
					<img src={TRASH_ICON} class="ms-2" style={filterDanger+" height: 1.25em;"}/>
				</a>
			</>);
		}

		else {
			cardStyle="border-bottom: none";
			cardClass+="shadow-sm";
			labelLink+="stretched-link";
		}

		menuViews.push(
			<div class={cardClass}>
				<div class="card-header position-relative d-flex justify-content-between align-items-center" style={cardStyle}>
					<a href="#" class={labelLink} onclick={onMenuHeaderClick} data-index={menuIndex}>
						{menu.label}
					</a>
					{cardIcons}
				</div>
				{cardBody}
			</div>      
		);
	}

	return (
		<>
			<h1 class="d-inline-block">Menus</h1>
			<AdminMessages />
			<ul class="nav nav-tabs mb-3">
				{menuTabs}
			</ul>
			<div style="max-width: 40rem">
				{menuViews}
				<button class="btn btn-light btn-lg mb-3 shadow-sm border" style="width: 100%"
						onclick={onAddMenuClick}>
					+
				</button>
			</div>
			<button class="btn btn-primary" onclick={onSaveClick}>Save Menu</button>
		</>
	);
}
