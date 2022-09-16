import { Command } from '../utils/Command';
import { Ping } from './Ping/Ping';
import { Reddit } from './Reddit/Reddit';

// settings commands for admins
import { Blacklist } from './Settings/Blacklist';
import { Info } from './Settings/Info';
import { Nsfw } from './Settings/Nsfw';

export const SlashCommands: Command[] = [Ping, Reddit, Info, Blacklist, Nsfw];