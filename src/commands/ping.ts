import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import { SlashCommand } from '../types';

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.reply('Pong!');
    },
};