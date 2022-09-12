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

	get(serverId: string): T {
		return this.table.get(serverId);
	}

	has(serverId: string): boolean {
		return this.table.has(serverId);
	}

	set(serverId: string, value: T) {
		return this.table.set(serverId, value);
	}

	delete(serverId: string) {
		return this.table.delete(serverId);
	}
}