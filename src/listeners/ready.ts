import { Client } from 'discord.js';
import { SlashCommands } from '../commands/SlashCommands';

export default (client: Client): void => {
	client.on('ready', () => {
		if (!client.user || !client.application) {
			return;
		}

		client.application.commands.set(SlashCommands).then(acm => {
			const names: string[] = [];

			acm.mapValues(value => {
				names.push(value.name);
			});

			console.log('following commands have been (re-)deployed: ' + names.join(', '));
		});
	});
};