import Enmap from 'enmap';

export default abstract class Table<T> {

	name: string;
	table: Enmap;

	constructor(name: string) {
		this.name = name;

		this.table = new Enmap({
			name: name,
			fetchAll: false,
			autoFetch: true,
			cloneLevel: 'deep',
		});
	}

	get(key: string): T {
		return this.table.get(key);
	}

	has(key: string): boolean {
		return this.table.has(key);
	}

	set(key: string, value: T) {
		return this.table.set(key, value);
	}

	delete(key: string) {
		return this.table.delete(key);
	}
}