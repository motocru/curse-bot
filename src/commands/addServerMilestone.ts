import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

export const addServerMilestoneCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('add-server-milestone')
        .setDescription('Adds a server milestone')
        .addIntegerOption(option =>
            option.setName('milestone')
                .setDescription('The milestone to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send when the milestone is reached')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const milestone = interaction.options.getInteger('milestone');
        const message = interaction.options.getString('message');
        if (milestone && message) {
            //await addServerMilestone(interaction.guildId, milestone, message);
            await interaction.reply(`Added milestone ${milestone} for server`);
        }
    }
};