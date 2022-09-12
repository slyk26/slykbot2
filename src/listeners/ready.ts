import { Client } from 'discord.js';
import { SlashCommands } from '../commands/SlashCommands';
import { getLoggerFor } from '../utils/Logger';
import { prepareReddit } from '../commands/Reddit/api';

const logger = getLoggerFor('client');

export default (client: Client): void => {
	logger.info('starting up...');
	client.once('ready', () => {
		if (!client.user || !client.application) {
			logger.error('client has missing properties: client.user | client.application');
			return;
		}
		// startup methods
		prepareReddit();

		client.application.commands.set(SlashCommands).then(acm => {
			const names: string[] = [];
			acm.mapValues(value => {
				names.push(value.name);
			});
			logger.info('following commands have been deployed: ' + names.join(', '));
			logger.info('... startup complete!');
		});
	});
};