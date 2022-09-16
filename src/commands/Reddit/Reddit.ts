import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../utils/Command';
import { getRandomPost } from './api';

export const Reddit: Command = {
	ephermal: false,
	name: 'reddit',
	description: 'returns a post from a subreddit',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		const input = interaction.options.data.find(o => o.name === 'subreddit');
		let subreddit = 'hmmm';


		if (input && typeof input.value === 'string') {
			// dont allow whitespaces
			subreddit = input.value.split(' ')[0];
		}

		getRandomPost(interaction.guildId, subreddit).then(async response => {
			const message = await interaction.followUp({
				content: response.getFormattedResponse(),
			});

			message.react('⬆️');
			message.react('⬇️');
		});

	},
	options: [
		{
			name: 'subreddit',
			type: ApplicationCommandOptionType.String,
			description: 'get a random post from this subreddit',
		},
	],
};
