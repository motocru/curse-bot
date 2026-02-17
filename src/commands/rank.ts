import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const rankCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('gets the rank of a specific user in the server')
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse word to count')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const curse = interaction.options.getString('curse');
        if (curse) {
            //TODO: get the rank of the specific curse word in the server
            await interaction.reply(`rank of ${curse}`);
        } else {
            //TODO: get the rank of the curse words in the server amongst all users
            await interaction.reply('unable to get rank');
        }
    },
}