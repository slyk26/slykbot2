import { Client, Guild } from 'discord.js';
import { getLoggerFor } from '../utils/Logger';
import redditTable from '../database/table/RedditTable';

const logger = getLoggerFor('guildDelete');

export default (client: Client): void => {
	client.on('guildDelete', (guild: Guild) => {
		logger.info(`Bot removed from ${guild.name}`);
		redditTable.delete(guild.id);
	});
};
