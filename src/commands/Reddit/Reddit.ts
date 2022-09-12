import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../Command';
import { getRandomPost } from './api';
import { ApiResponse, ResponseType } from './ApiResponse';
import redditTable from '../../database/table/RedditTable';

export const Reddit: Command = {
	ephermal: false,
	name: 'reddit',
	description: 'returns a post from a subreddit',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		// user-added optional option
		const option = interaction.options.data.find(o => o.name === 'subreddit');
		let subreddit = 'hmmm';


		if (option && typeof option.value === 'string') {
			// dont allow whitespaces
			subreddit = option.value.split(' ')[0];
		}

		if (interaction.guildId && redditTable.get(interaction.guildId).subredditBlacklist.includes(subreddit.toLocaleLowerCase())) {
			await interaction.followUp({
				content: formatMessage(new ApiResponse('-1', 'got blacked', `r/${subreddit} is blacklisted`, ResponseType.ERROR, '')),
			});
		}
		else {
			getRandomPost(subreddit).then(async response => {
				const message = await interaction.followUp({
					content: formatMessage(response),
				});

				message.react('⬆️');
				message.react('⬇️');
			});
		}
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
	case ResponseType.ERROR:
		message = `:moyai: ${response.title} \n ${response.content}`;
		break;
	case ResponseType.TEXT:
		message = `:pencil2: ${response.title} \n\n ${response.content}`;
		break;
	case ResponseType.IMAGE: case ResponseType.GIF: case ResponseType.VIDEO:
		message = `:camera_with_flash: [ ${response.title}](${response.content})`;
		break;
	case ResponseType.WEBSITE:
		message = `:link: [ ${response.title}](${response.content})`;
		break;
	case ResponseType.GALLERY:
		message += ':open_file_folder: ' + response.title + '\n';
		for (let i = 0;i < response.content.length;i++) {
			message += `[[Img  ${i}]](${response.content[i]})`;
		}
		if (response.content.length > 5) {
			message = `:nerd: Too many images (${response.content.length}/5) in Gallery >> [Original Link](${response.src})`;
		}
		break;
	}

	if (message.length > 2000) {
		message = `:nerd: Message body too long [${[message.length]}/2000] >> [Original Link](${response.src})`;
	}

	return message;
}