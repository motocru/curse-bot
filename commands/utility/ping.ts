import { CommandInteraction, SlashCommandBuilder } from "discord.js";

function ping() {
    return new SlashCommandBuilder()
        .setName('ping')
        .setDescription('replies with: Pong!')
}

async function handle(interaction: CommandInteraction) {
    interaction.channel?.send("Pong!");
}

export default {
    ping,
    handle
}