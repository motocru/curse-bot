import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const removeCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('removes a curse from the list')
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse to remove')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const curse = interaction.options.getString('curse');
        if (curse) {
            //TODO: remove curse from the database for the given server
            await interaction.reply(`removed ${curse} from the list`);
        } else {
            await interaction.reply('unable to remove curse');
        }
    },
}