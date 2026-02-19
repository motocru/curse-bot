import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";
import { getServerSwearRankingsAsync, getServerSpecificSwearRankings } from "../db/servers";
import { serverNoSwearsFound } from "../lib/helper";

export const rankCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('gets the rank of a specific user in the server')
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse word to count')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const curse = interaction.options.getString('curse');
        if (curse) {
            const rankings = await getServerSpecificSwearRankings(interaction.guildId!, curse);
            const responseString = await swearStringBuilder(interaction, rankings);
            if (responseString === '') {
                await interaction.reply(`No rankings found for ${curse}`);
            } else {
                await interaction.reply(responseString);
            }
        } else {
            const rankings = await getServerSwearRankingsAsync(interaction.guildId!);
            const responseString = await swearStringBuilder(interaction, rankings);
            if (responseString === '') {
                await interaction.reply(serverNoSwearsFound);
            } else {
                await interaction.reply(responseString);
            }
        }
    },
}

async function swearStringBuilder(interaction: ChatInputCommandInteraction, curses: Record<string, number>) {
    let responseString = '';
    await Promise.all(Object.entries(curses).map(async ([key, value]) => {
        //get the member for the key
        const member = await interaction.guild?.members.fetch(key);
        responseString += `${member?.displayName}: ${value} swears\n`;
    }));
    return responseString;
}