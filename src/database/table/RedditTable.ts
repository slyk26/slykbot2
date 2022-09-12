import RedditRecord from '../record/RedditRecord';
import Table from './Table';

class RedditTable extends Table<RedditRecord> {
	constructor() {
		super('reddit');
	}
}

const redditTable = new RedditTable();
export default redditTable;