import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const totalCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('total')
        .setDescription('shows the total number of times each individual curse word has been used in the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to check the total curse count for')
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