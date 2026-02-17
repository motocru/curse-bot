import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const countCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription('counts the number of curse words in the server or for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to count curse words for')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user');
        if (user) {
            var member = await interaction.guild?.members.fetch(user.id);
            //TODO: get total curse count for the user
            await interaction.reply(`total curse count for ${member?.displayName}`);
        } else {
            //TODO: get total curse count for the server
            await interaction.reply('total curse count for the server');
        }
    },
}