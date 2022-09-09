export class ApiResponse {
	constructor(id: string, title: string, content: string | string[], type: ResponseType, src: string) {
		this.id = id;
		this.title = title;
		this.content = content;
		this.type = type;
		this.src = src;
	}

	id: string;
	title: string;
	content: string | string[];
	type: ResponseType;
	src: string;
}

export const enum ResponseType {
    IMAGE = 'Image',
	GIF = 'GIF',
    TEXT = 'Text',
    VIDEO = 'Video',
    GALLERY = 'Gallery',
    WEBSITE = 'External',
    ERROR = 'Error'
}