import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { addUserMilestone } from "../db/servers";

export const addUserMilestoneCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('add-user-milestone')
        .setDescription('Adds a user milestone')
        .addIntegerOption(option =>
            option.setName('milestone')
                .setDescription('The milestone to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send when the milestone is reached')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const message = interaction.options.getString('message');
        const milestone = interaction.options.getInteger('milestone');
        if (message && milestone) {
            await addUserMilestone(interaction.guildId!, milestone, message);
            await interaction.reply(`Added milestone for user level swears`);
        } else {
            await interaction.reply(`Missing required arguments of milestone and message`);
        }
    }
};