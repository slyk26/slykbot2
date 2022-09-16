export default class NsfwRecord {
	requestedServer: string;
	added: Date;

	constructor(requestedServer: string, added: Date = new Date()) {
		this.requestedServer = requestedServer;
		this.added = added;
	}
}