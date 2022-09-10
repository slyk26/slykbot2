import { CommandInteraction, Client, Interaction } from 'discord.js';
import { SlashCommands } from '../commands/SlashCommands';
import { getLoggerFor } from '../utils/logger';

const logger = getLoggerFor('interactionCreate');

export default (client: Client): void => {
	client.on('interactionCreate', (interaction: Interaction) => {
		if (interaction.isCommand() || interaction.isContextMenuCommand()) {
			handleSlashCommand(client, interaction).catch(e => {
				logger.error('ineraction failed');
				logger.error(e);
			});
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
