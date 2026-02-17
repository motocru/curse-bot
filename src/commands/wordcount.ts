import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const wordCountCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('wordcount')
        .setDescription('gets the count of a specific curse word in the server or for a user')
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse word to count')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to count curse words for')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const curse = interaction.options.getString('curse');
        const user = interaction.options.getUser('user');
        if (curse) {
            if (user) {
                //TODO: get the count of the specific curse word for the given user
                await interaction.reply(`count of ${curse} for ${user.displayName}`);
            } else {
                //TODO: get the count of the specific curse word for the given server
                await interaction.reply(`count of ${curse} for the server`);
            }
        } else {
            await interaction.reply('unable to get count');
        }
    },
}