import { Command } from '../utils/Command';
import { Ping } from './Ping/Ping';
import { Reddit } from './Reddit/Reddit';

// settings commands for admins
import { Blacklist } from './Settings/Blacklist';
import { Nsfw } from './Settings/Nsfw';
import { Info } from './Settings/Info';

export const SlashCommands: Command[] = [Ping, Reddit, Info, Blacklist, Nsfw];