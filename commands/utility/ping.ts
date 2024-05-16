import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('returns a pong to the user'),
    async execute(interaction) {
        console.log(interaction);
        await interaction.reply('pong!');
    }
};