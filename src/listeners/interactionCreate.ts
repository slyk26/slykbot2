import { CommandInteraction, Client, Interaction } from 'discord.js';
import { SlashCommands } from '../commands/SlashCommands';

export default (client: Client): void => {
	client.on('interactionCreate', async (interaction: Interaction) => {
		if (interaction.isCommand() || interaction.isContextMenuCommand()) {
			await handleSlashCommand(client, interaction);
		}
	});
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
	const command = SlashCommands.find(c => c.name === interaction.commandName);
	if (!command) {
		return;
	}
	await interaction.deferReply();
	command.run(client, interaction);
};
