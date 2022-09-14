import { Client, CommandInteraction, ApplicationCommandType, GuildMember, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/Command';
import redditTable from '../../database/table/RedditTable';
import RedditRecord from '../../database/record/RedditRecord';
import { getLoggerFor } from '../../utils/Logger';

const logger = getLoggerFor('/info');

export const Info: Command = {
	ephermal: true,
	name: 'info',
	description: 'shows the config of this server',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		if (!interaction.isChatInputCommand() || !interaction.guild || !interaction) return;

		const serverId = interaction.guildId;
		let content = 'nothing happened';

		if (serverId) {
			const member = interaction.member as GuildMember;
			const isMod = member.permissions.has(PermissionFlagsBits.ModerateMembers);

			if (!isMod) {
				logger.debug(`${member.displayName} is not a mod`);
				await interaction.followUp({
					content: 'Settings are only for Admins/Mods',
				});
				return;
			}

			if (!redditTable.has(serverId)) {
				logger.debug('record didn`t exist for: ' + serverId + ' - creating record');
				redditTable.set(serverId, new RedditRecord(serverId));
			}
			const record = redditTable.get(serverId);

			content = `[${interaction.guild.name}] \n`;
			content += `Blacklisted Subreddits: ${record.subredditBlacklist}\n`;
			content += `NSFW Posts allowed: ${record.nsfw}`;
			logger.debug(content);
		}
		else {
			logger.debug('command called outside of a server');
			content = 'this is not a server';
		}

		await interaction.followUp({
			content,
		});
	},
};
