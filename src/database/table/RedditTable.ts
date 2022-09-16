import Table from '../../utils/Table';
import RedditRecord from '../record/RedditRecord';

// key => serverId
class RedditTable extends Table<RedditRecord> {
	constructor() {
		super('reddit');
	}
}

const redditTable = new RedditTable();
export default redditTable;