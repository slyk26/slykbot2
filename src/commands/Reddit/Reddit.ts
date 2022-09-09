import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../Command';
import { getRandomPost } from './api';
import { ApiResponse, ResponseType } from './ApiResponse';

export const Reddit: Command = {
	name: 'reddit',
	description: 'returns a post from a subreddit',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		// user-added optional option
		const option = interaction.options.data.find(o => o.name === 'subreddit');
		let subreddit = 'hmmm';


		if (option && typeof option.value === 'string') {
			subreddit = option.value;
		}

		getRandomPost(subreddit).then(async response => {
			await interaction.followUp({
				content: formatMessage(response),
			});
		}).catch(async e => {
			await interaction.followUp({
				content: '' + e,
			});
		});
	},
	options: [
		{
			// option
			name: 'subreddit',
			type: ApplicationCommandOptionType.String,
			description: 'get a random post from this subreddit',
		},
	],
};

function formatMessage(response: ApiResponse) {
	let message = '';

	switch (response.type) {
	case ResponseType.TEXT: case ResponseType.ERROR:
		message = `[${response.type}] ${response.title} \n\n ${response.content} `;
		break;
	case ResponseType.IMAGE: case ResponseType.GIF: case ResponseType.VIDEO: case ResponseType.WEBSITE:
		message = `[${response.type}] [ ${response.title}](${response.content})`;
		break;
	case ResponseType.GALLERY:
		message += '[Gallery]' + response.title + '\n';
		for (let i = 0;i < response.content.length;i++) {
			message += `[[Img  ${i}]](${response.content[i]}) `;
		}
		if (response.content.length > 5) {
			message = `[Gallery] Too many images (${response.content.length}/5) in Gallery >> [Original Link](${response.src})`;
		}
		break;
	}

	if (message.length > 2000) {
		message = `[Info] Message body too long [${[message.length]}/2000] >> [Original Link](${response.src})`;
	}

	return message;
}