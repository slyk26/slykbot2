export default class RedditRecord {
	serverId: string;
	subredditBlacklist: string[];
	nsfw: boolean;

	constructor(serverId: string, nsfw = false) {
		this.serverId = serverId;
		this.subredditBlacklist = [];
		this.nsfw = nsfw;
	}
}