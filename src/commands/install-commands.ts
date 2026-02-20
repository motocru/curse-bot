import { REST, Routes } from 'discord.js';
import { helpCommand } from './help';
import { totalCommand } from './total';
import { addCommand } from './add';
import { removeCommand } from './remove';
import { countCommand } from './count';
import { firstCommand } from './first';
import { rankCommand } from './rank';

const commands = [
    helpCommand.data.toJSON(),
    totalCommand.data.toJSON(),
    addCommand.data.toJSON(),
    removeCommand.data.toJSON(),
    countCommand.data.toJSON(),
    firstCommand.data.toJSON(),
    rankCommand.data.toJSON()
];


const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    throw new Error("TOKEN not found");
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

export async function installCommands(clientId: string, guildId?: string) {
    try {
        console.log(`Started refreshing application (/) commands${guildId ? ` for guild ${guildId}` : ''}.`);

        const route = guildId
            ? Routes.applicationGuildCommands(clientId, guildId)
            : Routes.applicationCommands(clientId);

        await rest.put(
            route,
            { body: commands }
        );

        console.log(`Successfully reloaded application (/) commands${guildId ? ` for guild ${guildId}` : ''}.`);
    } catch (error) {
        console.error(error);
    }
}