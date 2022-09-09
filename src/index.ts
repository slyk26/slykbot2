import { Client, GatewayIntentBits } from 'discord.js';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// event listeners
ready(client);
interactionCreate(client);

// start the bot
client.login(process.env.DISCORD_TOKEN);