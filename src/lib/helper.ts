import { GuildMember } from "discord.js";

const SWEAR_EDITOR_ROLE = 'SWEAR EDITOR'

export async function canEditSwearList(member: GuildMember): Promise<boolean> {
    //I AM THE OWNER
    if (member.user.id === '345968473618382850') return true;

    if (member.roles.cache.some(role => role.name === SWEAR_EDITOR_ROLE)) return true;
    var role = await member.guild.roles.fetch(SWEAR_EDITOR_ROLE);
    return role !== null;
}