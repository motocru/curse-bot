import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const firstCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('first')
        .setDescription('gets the first curse word in the list'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        //TODO: get the first curse word and first user to swear from the database
        await interaction.reply('first curse word');
    },
}