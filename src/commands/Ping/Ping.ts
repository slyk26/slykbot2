import { CommandInteraction, Client, ApplicationCommandType } from 'discord.js';
import { Command } from '../Command';

export const Ping: Command = {
	ephermal: true,
	name: 'ping',
	description: 'Returns Pong!',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: CommandInteraction) => {
		const content = 'Pong!';

		await interaction.followUp({
			content,
		});
	},
};