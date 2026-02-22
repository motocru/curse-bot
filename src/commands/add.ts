import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { canEditSwearList } from "../lib/helper";
import { addSwearToCustomListAsync } from "../db/servers";

export const addCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('adds a curse to the list')
        .addStringOption(option =>
            option.setName('curse')
                .setDescription('the curse to add')
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
            //add the curse word to the server's swear list
            var addedSwear = await addSwearToCustomListAsync(interaction.guildId!, curse);
            if (addedSwear) {
                await interaction.reply(`added "${curse}" to the list of swear words for ${interaction.guild?.name}`);
            } else {
                await interaction.reply(`"${curse}" is already in the list of swear words for ${interaction.guild?.name}`);
            }
        } else {
            await interaction.reply('unable to add curse');
        }
    },
}