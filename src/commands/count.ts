import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";
import { serverSwearCount, getServerSpecificSwearCount } from "../db/servers";
import { getUserSwearCountAsync, getUserSpecificSwearCountAsync } from "../db/users";
import { serverNoSwearsFound } from "../lib/helper";

export const countCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription('counts the number of curse words in the server or for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to count curse words for')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse word to count')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user');
        var curse = interaction.options.getString('curse');
        //first we separate it by the user
        if (user) {
            //get member for either option then separate if we are looking for a specific curse word
            var member = await interaction.guild?.members.fetch(user.id);
            if (curse) {
                curse = curse.toUpperCase();
                const count = await getUserSpecificSwearCountAsync(interaction.guildId!, user.id, curse);
                await interaction.reply(`total uses of "${curse}" by ${member?.displayName}: ${count}`);
            } else {
                const count = await getUserSwearCountAsync(interaction.guildId!, user.id);
                if (count > 0) {
                    await interaction.reply(`total curse count for ${member?.displayName}: ${count}`);
                } else {
                    await interaction.reply(`${member?.displayName} has not yet cursed on this server\nThey are pure of heart and free from sin.`);
                }
            }
        } else {
            //if no user is selected, we look for server wide curse word counts
            if (curse) {
                curse = curse.toUpperCase();
                const count = await getServerSpecificSwearCount(interaction.guildId!, curse);
                await interaction.reply(`total uses of "${curse}" in ${interaction.guild?.name}: ${count}`);
            } else {
                const count = await serverSwearCount(interaction.guildId!);
                if (count > 0) {
                    await interaction.reply(`total swear count for ${interaction.guild?.name}: ${count}`);
                } else {
                    await interaction.reply(serverNoSwearsFound);
                }
            }
        }
    },
}