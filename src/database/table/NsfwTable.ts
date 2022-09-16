import Table from '../../utils/Table';
import NsfwRecord from '../record/NsfwRecord';

// key => subreddit name
class NsfwTable extends Table<NsfwRecord> {
	constructor() {
		super('nsfw');
	}
}

const nsfwTable = new NsfwTable();
export default nsfwTable;