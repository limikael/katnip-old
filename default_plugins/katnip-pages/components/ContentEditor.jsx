import LIST_NESTED from "bootstrap-icons/icons/list-nested.svg";
import PLUS_LG from "bootstrap-icons/icons/plus-lg.svg";
import PUZZLE_FILL from "bootstrap-icons/icons/puzzle-fill.svg";
import CODE_SLASH from "bootstrap-icons/icons/code-slash.svg";
import FILE_EARMARK_TEXT_FILL from "bootstrap-icons/icons/file-earmark-text-fill.svg";
import {katnip, bindArgs, useForm, PromiseButton, setTemplateContext,
		Editor, useEditor, useInstance, useEventUpdate, useModal} from "katnip";
import ContentEditorState from "./ContentEditorState.js";
import * as ce from "./content-editor-components.jsx";

const whiteFilter="filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);";
const primaryFilter="filter: invert(30%) sepia(100%) saturate(1483%) hue-rotate(203deg) brightness(96%) contrast(108%);";

export default function ContentEditor({metaEditor, read, write, deps, saveLabel}) {
	let [modal, showModal, resolveModal]=useModal();

	async function showCodeErrorModal(error) {
		return await showModal(<ce.CodeErrorModal 
			resolve={resolveModal}
			error={error}
		/>);
	}

	setTemplateContext({tight: true});

	let editor=useEditor({
		contentRenderer: katnip.contentRenderer,
	});

	let form=useForm({
		initial: async ()=>{
			let data=await read();
			editor.setDoc(data.content);

			return data;
		},
		deps: deps
	});

	let contentEditor=useInstance(ContentEditorState,editor,form,showCodeErrorModal);
	useEventUpdate(contentEditor,"change");

	async function writeClick() {
		if (contentEditor.codeMode)
			await contentEditor.toggleCodeMode();

		if (contentEditor.codeMode)
			return;

		let saveData=form.getCurrent();
		saveData.content=editor.doc;

		let saved=await write(saveData);
		form.setCurrent(saved);
	}

	if (!form.getCurrent())
		return;

	let MetaEditor=metaEditor;

	return (
		<div style="width: 100%; height: calc( 100% - 40px )" class="d-flex flex-column">
			{modal}
			<style>{`
				button.btn-outline-primary .btn-image {
					filter: invert(30%) sepia(100%) saturate(1483%) hue-rotate(203deg) brightness(96%) contrast(108%);
				}

				button.btn-primary .btn-image,
				button.btn-outline-primary:hover .btn-image {
					filter: invert(100%) sepia(19%) saturate(1%) hue-rotate(216deg) brightness(108%) contrast(102%);
				}
			`}</style>
			<div class="bg-light p-3 border-bottom d-flex flex-row">
				<button class={`btn btn-primary me-2 ${contentEditor.leftMode=="tree"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleLeftMode,"tree")}>
					<img src={LIST_NESTED} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn btn-primary me-2 ${contentEditor.leftMode=="components"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleLeftMode,"components")}>
					<img src={PLUS_LG} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn me-2 align-text-bottom ${contentEditor.codeMode?"btn-primary":"btn-outline-primary"}`}
						style="height: 2.4em"
						onclick={contentEditor.toggleCodeMode}>
					<img src={CODE_SLASH} class="btn-image"/>
				</button>
				<h2 class="d-inline-block mb-0 me-auto">{form.getCurrent().title}</h2>
				<button class={`btn btn-primary ms-2 ${contentEditor.rightMode=="component"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleRightMode,"component")}>
					<img src={PUZZLE_FILL} style={`${whiteFilter}`}/>
				</button>
				<button class={`btn btn-primary ms-2 ${contentEditor.rightMode=="document"?"active":""} align-text-bottom`}
						style="height: 2.4em"
						onclick={bindArgs(contentEditor.toggleRightMode,"document")}>
					<img src={FILE_EARMARK_TEXT_FILL} style={`${whiteFilter}`}/>
				</button>
				<PromiseButton class={`btn btn-primary ms-2`} onclick={writeClick}>
					{saveLabel}
				</PromiseButton>
			</div>
			<div class="flex-grow-1 d-flex flex-row" style="overflow: hidden;">
				{!contentEditor.codeMode && contentEditor.leftMode=="tree" &&
					<div class="bg-light border-end p-3 flex-shrink-0" style="width: 25%; overflow: scroll;">
						<ce.EditorStructure editor={editor} contentEditor={contentEditor}/>
					</div>
				}
				{!contentEditor.codeMode && contentEditor.leftMode=="components" &&
					<div class="bg-light border-end p-3 flex-shrink-0" style="width: 25%">
						<ce.ComponentLibrary editor={editor} contentEditor={contentEditor}/>
					</div>
				}

				{contentEditor.codeMode && 
					<div class="flex-grow-1" style="overflow: hidden;">
						<ce.CodeEditor contentEditor={contentEditor}/>
					</div>
				}
				{!contentEditor.codeMode &&
					<div class="flex-grow-1" style="overflow: scroll;">
						<Editor class="m-3" editor={editor}/>
					</div>
				}

				{contentEditor.rightMode=="component" &&
					<div class="bg-light border-start p-3 flex-shrink-0" style="width: 25%">
						<ce.ComponentProperties editor={editor}/>
					</div>
				}
				{contentEditor.rightMode=="document" &&
					<div class="bg-light border-start p-3 flex-shrink-0" style="width: 25%">
						<MetaEditor form={form}/>
					</div>
				}
			</div>
			<div class="bg-light border-top px-3 py-1 small">
				{contentEditor.codeMode &&
					<ce.CodeEditorStatus contentEditor={contentEditor} />
				}
				{!contentEditor.codeMode &&
					<ce.EditorPath editor={editor}/>
				}
			</div>
		</div>
	);
}
