import { GuildMember, User } from "discord.js";

export const serverNoSwearsFound = 'This server has somehow avoided any curse words\n...how?';
const SWEAR_EDITOR_ROLE = 'SWEAR EDITOR'

export async function canEditSwearList(member: GuildMember): Promise<boolean> {
    if (member.user.id === '345968473618382850') return true;

    if (member.roles.cache.some(role => role.name === SWEAR_EDITOR_ROLE)) return true;
    var role = await member.guild.roles.fetch(SWEAR_EDITOR_ROLE);
    return role !== null;
}