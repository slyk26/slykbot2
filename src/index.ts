import { Client, GatewayIntentBits, Partials } from 'discord.js';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import guildDelete from './listeners/guildDelete';
const client = new Client({ partials: [Partials.Channel], intents: [GatewayIntentBits.Guilds] });

// event listeners
ready(client);
interactionCreate(client);
guildDelete(client);

// start the bot
client.login(process.env.NODE_ENV === 'development' ? process.env.DEV_DISCORD_TOKEN : process.env.DISCORD_TOKEN);