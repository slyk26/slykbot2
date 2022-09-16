import { Client, Guild } from 'discord.js';
import redditTable from '../database/table/RedditTable';
import { getLoggerFor } from '../utils/Logger';

const logger = getLoggerFor('guildDelete');

export default (client: Client): void => {
	client.on('guildDelete', (guild: Guild) => {
		logger.info(`Bot removed from ${guild.name}`);
		redditTable.delete(guild.id);
	});
};
