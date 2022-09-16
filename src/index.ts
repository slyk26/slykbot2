import { Client, GatewayIntentBits, Partials } from 'discord.js';
import guildDelete from './listeners/guildDelete';
import interactionCreate from './listeners/interactionCreate';
import ready from './listeners/ready';
const client = new Client({ partials: [Partials.Channel], intents: [GatewayIntentBits.Guilds] });

// event listeners
ready(client);
interactionCreate(client);
guildDelete(client);

// start the bot
client.login(process.env.NODE_ENV === 'development' ? process.env.DEV_DISCORD_TOKEN : process.env.DISCORD_TOKEN);