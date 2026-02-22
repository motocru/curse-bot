import { SlashCommand } from "../types";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getServerSealBreaker } from "../db/servers";
import { serverNoSwearMessage } from "../../curses.json";

export const firstCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('first')
        .setDescription('gets the first curse word in the list'),
    async execute(interaction: ChatInputCommandInteraction) {
        const firstUser = await getServerSealBreaker(interaction.guildId!);
        if (firstUser != null) {
            const server = await interaction.guild?.fetch();
            const guildMember = await server?.members.fetch(firstUser);
            await interaction.reply(`${guildMember?.displayName} was the first person to curse on this server.`);
        } else {
            await interaction.reply(serverNoSwearMessage);
        }
    },
}