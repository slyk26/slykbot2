import { Client, CommandInteraction, ApplicationCommandType, GuildMember, PermissionFlagsBits, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../utils/Command';
import redditTable from '../../database/table/RedditTable';
import RedditRecord from '../../database/record/RedditRecord';
import { getValueOfOption } from '../../utils/helper';
import { getLoggerFor } from '../../utils/Logger';

const logger = getLoggerFor('/nsfw');

export const Nsfw: Command = {
	ephermal: true,
	name: 'nsfw',
	description: 'toggles if the bot should fetch nsfw results',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		if (!interaction.isChatInputCommand()) return;

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

			record.nsfw = !!getValueOfOption(interaction.options.data, ['nsfw', 'filter']);
			redditTable.set(serverId, record);
			content = 'nsfw filtering changed to: ' + record.nsfw;
			logger.debug(content);
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
			name: 'nsfw',
			description: 'toggle to filter nsfw subreddits',

			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'filter',
					description: 'filter nsfw',
					required: true,
				},
			],
		},
	],
};
