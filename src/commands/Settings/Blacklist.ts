import { Client, CommandInteraction, ApplicationCommandType, GuildMember, PermissionFlagsBits, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../utils/Command';
import { getValueOfOption } from '../../utils/helper';
import redditTable from '../../database/table/RedditTable';
import RedditRecord from '../../database/record/RedditRecord';
import { getLoggerFor } from '../../utils/Logger';

const logger = getLoggerFor('/blacklist');

export const Blacklist: Command = {
	ephermal: true,
	name: 'blacklist',
	description: 'blacklists a subreddit from the bot',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		if (!interaction.isChatInputCommand()) return;

		const serverId = interaction.guildId;
		const command = interaction.options.getSubcommand();

		let content = 'nothing happened';

		if (serverId) {
			const member = interaction.member as GuildMember;
			const isAdmin = member.permissions.has(PermissionFlagsBits.ModerateMembers);

			if (!isAdmin) {
				logger.debug(`${member.displayName} is not an admin`);
				await interaction.followUp({
					content: 'this command is only for Admins',
				});
				return;
			}

			if (!redditTable.has(serverId)) {
				redditTable.set(serverId, new RedditRecord(serverId));
			}
			const record = redditTable.get(serverId);

			let input;
			let index: number;
			switch (command) {
			case 'add':
				input = (getValueOfOption(interaction.options.data, ['add', 'subreddit']) + '').toLocaleLowerCase().split(' ')[0];
				if (record.subredditBlacklist.indexOf(input) === -1) {
					record.subredditBlacklist.push(input);
					redditTable.set(serverId, record);
					content = `sucessfully added r/${input} to the blacklist`;
				}
				else {
					content = `r/ ${input} is already in the blacklist`;
				}
				break;
			case 'remove':
				input = (getValueOfOption(interaction.options.data, ['remove', 'subreddit']) + '').toLocaleLowerCase().split(' ')[0];
				index = record.subredditBlacklist.indexOf(input);
				if (index !== -1) {
					record.subredditBlacklist.splice(index, 1);
					redditTable.set(serverId, record);
					content = `sucessfully removed r/${input} from the blacklist`;
				}
				else {
					content = `r/ ${input} is not in the blacklist [${record.subredditBlacklist}]`;
				}
				break;
			}
			logger.debug(`[${member.displayName}]: ${content}`);
		}
		else {
			content = 'this is not a server';
		}
		await interaction.followUp({
			content,
		});
	},

	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add',
			description: 'adds a subreddit to the blacklist',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'subreddit',
					description: 'subreddit to add',
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'remove',
			description: 'removes a subreddit from the blacklist',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'subreddit',
					description: 'subreddit to remove',
					required: true,
				},
			],
		},
	],
};
