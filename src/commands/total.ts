import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";
import { getServerSwearTotal } from "../db/servers";
import { getUserSwearRecord } from "../db/users";
import { serverNoSwearsFound } from "../lib/helper";

export const totalCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('total')
        .setDescription('shows the total number of times each individual curse word has been used in the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to check the total curse count for')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user');
        if (user) {
            var member = await interaction.guild?.members.fetch(user.id);
            const rankings = await getUserSwearRecord(interaction.guildId!, user.id);
            const responseString = await swearStringBuilder(rankings);
            if (responseString === '') {
                await interaction.reply(`No rankings found for ${member?.displayName}`);
            } else {
                await interaction.reply(responseString);
            }
        } else {
            const rankings = await getServerSwearTotal(interaction.guildId!);
            const responseString = await swearStringBuilder(rankings);
            if (responseString === '') {
                await interaction.reply(serverNoSwearsFound);
            } else {
                await interaction.reply(responseString);
            }
        }
    },
}

function swearStringBuilder(curses: Record<string, number>) {
    let responseString = '';
    Object.entries(curses).map(([key, value]) => {
        responseString += `${key}: ${value}\n`;
    })
    return responseString;
}
