import { Client, CommandInteraction, ApplicationCommandType, GuildMember, PermissionFlagsBits } from 'discord.js';
import { Command } from '../Command';
import { Info, Reddit } from './Subcommands';
import redditTable from '../../database/table/RedditTable';
import RedditRecord from '../../database/record/RedditRecord';

export const Settings: Command = {
	ephermal: true,
	name: 'settings',
	description: 'server settings',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		if (!interaction.isChatInputCommand()) return;

		const serverId = interaction.guildId;
		const command = interaction.options.getSubcommand();

		let content = 'ok';

		if (serverId) {
			const member = interaction.member as GuildMember;
			const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

			if (!isAdmin) {
				await interaction.followUp({
					content: 'Settings are only for Admins',
				});
				return;
			}


			if (!redditTable.has(serverId)) {
				redditTable.set(serverId, new RedditRecord(serverId));
			}

			const record = redditTable.get(serverId);

			let sub;
			let subsub;
			let value;
			let bl: string;
			switch (command) {
			case 'info':
				content = JSON.stringify(record) ? JSON.stringify(record) : 'no data';
				break;
			case 'clear':
				redditTable.delete(serverId);
				content = 'deleted record for: ' + serverId;
				break;
			case 'nsfw':
				sub = interaction.options.data.find(o => o.name === 'reddit');
				if (sub && sub.options) {
					subsub = sub.options.find(o => o.name === 'nsfw');
					if (subsub && subsub.options) {
						value = subsub.options.find(o => o.name === 'filter');
					}
					record.nsfw = !!value;
					redditTable.set(serverId, record);
				}
				break;
			case 'blacklist':
				sub = interaction.options.data.find(o => o.name === 'reddit');
				if (sub && sub.options) {
					subsub = sub.options.find(o => o.name === 'blacklist');
					if (subsub && subsub.options) {
						value = subsub.options.find(o => o.name === 'subreddit');
					}
					if (value && value.value) {
						bl = value.value.toLocaleString();
						if (record.subredditBlacklist.indexOf(bl) === -1) {
							record.subredditBlacklist.push(bl);
							redditTable.set(serverId, record);
							content = `sucessfully added r/${bl} to subredditBacklist`;
						}
						else {
							content = `r/ ${bl} is already in the subredditBacklist`;
						}

					}
				}
				break;
			}

		}
		else {
			content = 'this is not a server';
		}

		await interaction.followUp({
			content,
		});
	},

	options: [Info, Reddit],
};