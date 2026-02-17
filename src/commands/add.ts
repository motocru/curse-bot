import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const addCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('adds a curse to the list')
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse to add')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        console.log(interaction.user);
        const curse = interaction.options.getString('curse');
        if (curse) {
            //TODO: add curse to the database for the given server
            await interaction.reply(`added ${curse} to the list`);
        } else {
            await interaction.reply('unable to add curse');
        }
    },
}