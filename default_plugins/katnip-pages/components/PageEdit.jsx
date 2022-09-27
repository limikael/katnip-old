import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function PageEdit({request}) {
	let editor=useEditor({
		content: "hello world",
		extensions: [
			StarterKit,
		]
	});

	return (
		<div style="width: 100%; height: calc( 100% - 40px )" class="d-flex flex-column">
			<div class="bg-light p-3 border-bottom">
				<button class="btn btn-primary me-3">+</button>
				<button class="btn btn-primary">+</button>
			</div>
			<div class="flex-grow-1 d-flex flex-row">
				<div class="bg-light border-end" style="width: 25%">hello</div>
				<div class="flex-grow-1 p-3">
					<EditorContent editor={editor}/>
				</div>
				<div class="bg-light border-start" style="width: 25%">hello</div>
			</div>
			<div class="bg-light border-top px-3 py-1 small">
				Page &gt; Paragraph
			</div>
		</div>
	);
}