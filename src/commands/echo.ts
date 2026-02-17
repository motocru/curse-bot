import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export const echoCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input!')
        // Add a string option named 'input' which is required
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to echo back')
                .setRequired(true) // Makes the argument mandatory
        ),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const input = interaction.options.getString('input', true);
        await interaction.reply(input);
    },
}