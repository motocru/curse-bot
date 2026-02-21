import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { removeSwearFromCustomListAsync } from "../db/servers";
import { canEditSwearList } from "../lib/helper";

export const removeCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('removes a curse from the list')
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse to remove')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        //first check if user has permission to edit the swear list
        var canEdit = await canEditSwearList(interaction.member as GuildMember);
        if (!canEdit) {
            await interaction.reply('you do not have permission to edit the swear list');
            return;
        }
        //get the curse word from the interaction
        const curse = interaction.options.getString('curse');
        if (curse) {
            //remove the curse word from the server's swear list
            const removedCurse = await removeSwearFromCustomListAsync(interaction.guildId!, curse);
            if (removedCurse) {
                await interaction.reply(`removed "${curse}" from the list of swear words for ${interaction.guild?.name}`);
            } else {
                await interaction.reply(`"${curse}" is not in the list of swear words for ${interaction.guild?.name}`);
            }
        } else {
            await interaction.reply('unable to remove curse');
        }
    },
}