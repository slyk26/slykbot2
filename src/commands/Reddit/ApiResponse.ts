import config from './config.json';

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

	getFormattedResponse() {
		let message = '';
		switch (this.type) {
		case ResponseType.ERROR:
			message = `:moyai: ${this.title} \n ${this.content}`;
			break;
		case ResponseType.TEXT:
			message = `:pencil2: ${this.title} \n\n ${this.content}`;
			break;
		case ResponseType.IMAGE: case ResponseType.GIF: case ResponseType.VIDEO:
			message = `:camera_with_flash: [ ${this.title}](${this.content})`;
			break;
		case ResponseType.WEBSITE:
			message = `:link: [ ${this.title}](${this.content})`;
			break;
		case ResponseType.GALLERY:
			message += ':open_file_folder: ' + this.title + '\n';
			for (let i = 0;i < this.content.length;i++) {
				message += `[[Img  ${i}]](${this.content[i]}) `;
			}
			if (this.content.length > config.discordMaxEmbeds) {
				message = `:nerd: Too many images (${this.content.length}/${config.discordMaxEmbeds}) in Gallery >> [Original Link](${this.src})`;
			}
			break;
		}

		if (message.length > 2000) {
			message = `:nerd: Message body too long [${[message.length]}/2000] >> [Original Link](${this.src})`;
		}

		return message;
	}
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