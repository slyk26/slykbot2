import { Command } from './Command';
import { Ping } from './Ping/Ping';
import { Reddit } from './Reddit/Reddit';
import { Settings } from './Settings/Settings';

export const SlashCommands: Command[] = [Ping, Reddit, Settings];