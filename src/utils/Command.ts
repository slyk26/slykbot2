import { ChatInputApplicationCommandData, Client, CommandInteraction } from 'discord.js';

export interface Command extends ChatInputApplicationCommandData {
    ephermal: boolean;
    run: (client: Client, interaction: CommandInteraction) => void;
}