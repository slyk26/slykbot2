import { Client, CommandInteraction, Interaction } from 'discord.js';
import { SlashCommands } from '../commands/SlashCommands';
import { getLoggerFor } from '../utils/Logger';

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
	await interaction.deferReply({ ephemeral: command.ephermal });
	command.run(client, interaction);
};
