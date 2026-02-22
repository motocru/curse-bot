import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

const helpMessage = `\`\`\`
    Current Commands:
    /help -- Shows this message
    /total -- shows the total number of times each individual curse word has been used in the server
    /total <@user> -- Shows the total number of times each individual curse word has been used by a user (USER MUST BE @'D )
    /add <curse> -- Adds a curse to the list
    /remove <curse> -- Removes a curse from the list
    /count -- displays the number of times the server has cursed
    /count <@user> -- displays the number of times a user has cursed (USER MUST BE @'D )
    /count <curse> -- displays the number of times a specific curse word has been used in the server
    /count <curse> <@user> -- displays the number of times a specific curse word has been used by a user (USER MUST BE @'D )
    /first -- Specifies the first person to curse on the server
    /rank -- returns the rank of all users based on the number of times they have cursed
    /rank <curse> -- returns the rank of all users based on the number of times they have used a specific curse word
    /add-user-milestone <milestone> <message> -- Adds a milestone for a user (milestone is the number of times a user has cursed, will override previous milestones)
    /add-server-milestone <milestone> <message> -- Adds a milestone for the server (milestone is the number of times the server has cursed, will override previous milestones)
\`\`\``;

export const helpCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('How to use curseBot'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(helpMessage);
    },
};