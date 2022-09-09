import { Command } from './Command';
import { Ping } from './Ping/Ping';
import { Reddit } from './Reddit/Reddit';

export const SlashCommands: Command[] = [Ping, Reddit];