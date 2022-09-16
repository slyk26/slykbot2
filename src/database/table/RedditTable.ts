import RedditRecord from '../record/RedditRecord';
import Table from '../../utils/Table';

// key => serverId
class RedditTable extends Table<RedditRecord> {
	constructor() {
		super('reddit');
	}
}

const redditTable = new RedditTable();
export default redditTable;