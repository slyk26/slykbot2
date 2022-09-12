import { ApplicationCommandOptionType, ApplicationCommandSubCommand, ApplicationCommandSubGroup } from 'discord.js';

const Clear: ApplicationCommandSubCommand = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'clear',
	description: 'clear settings',
};

const Blacklist: ApplicationCommandSubCommand = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'blacklist',
	description: 'blacklist a subreddit',

	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'subreddit',
			description: 'setting to be changed',
			required: true,
		},
	],
};

const NSFW: ApplicationCommandSubCommand = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'nsfw',
	description: 'toggle to filter nsfw subreddits',

	options: [
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'filter',
			description: 'filter nsfw',
			required: true,
		},
	],
};

export const Reddit: ApplicationCommandSubGroup = {
	type: ApplicationCommandOptionType.SubcommandGroup,
	name: 'reddit',
	description: 'changes settings of reddit command',
	options: [
		Blacklist,
		NSFW,
		Clear,
	],
};

export const Info: ApplicationCommandSubCommand = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'info',
	description: 'shows the server config',
};