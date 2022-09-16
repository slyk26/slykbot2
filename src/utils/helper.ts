import { CacheType, CommandInteractionOption } from 'discord.js';

// recursive function to get value of an option inside a option chain
// fails if the keys dont match the option names
export function getValueOfOption(data: readonly CommandInteractionOption<CacheType>[], keys: string[]): string | number | boolean | undefined {
	const retVal = data.find(o => o.name == keys.shift());
	if (keys.length > 0) {
		if (retVal && retVal.options) {
			return getValueOfOption(retVal.options, keys);
		}
	}
	else {
		return retVal?.value;
	}
}