import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

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
        const user = interaction.options.getUser('user');
        const milestone = interaction.options.getInteger('milestone');
        if (user && milestone) {
            //await addUserMilestone(interaction.guildId, user.id, milestone);
            await interaction.reply(`Added milestone ${milestone} for user ${user.username}`);
        }
    }
};