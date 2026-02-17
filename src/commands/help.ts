import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

const helpMessage = `\`\`\`
    Current Commands:
    /help -- Shows this message
    /total -- shows the total number of times each individual curse word has been used in the server
    /total @user -- Shows the total number of times each individual curse word has been used by a user (USER MUST BE @'D )
    /add curse -- Adds a curse to the list
    /remove curse -- Removes a curse from the list
    /count -- displays the number of times the server has cursed
    /count @user -- displays the number of times a user has cursed (USER MUST BE @'D )
    /first -- Specifies the first person to curse on the server
    /wordcount curse -- returns the number of times a specific curse word has been used in the server
    /wordcount curse @user -- returns the number of times a specific curse word has been used by a user (USER MUST BE @'D )
    /rank -- returns the rank of all users based on the number of times they have cursed
    /rank curse -- returns the rank of all users based on the number of times they have used a specific curse word
\`\`\``;

export const helpCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('How to use curseBot'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.reply(helpMessage);
    },
};