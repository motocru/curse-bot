import { GuildMember, User } from "discord.js";

const SWEAR_EDITOR_ROLE = 'SWEAR EDITOR'

async function canEditSwearList(member: GuildMember, user: User) {
    if (user.id === '345968473618382850') return true;

    //TODO: check cache and if not present then get the server roles and return
    //      based on if the user has the SWEAR EDITOR role
    member.roles.guild.roles.cache.get(SWEAR_EDITOR_ROLE);
    if (member.roles.cache.some(role => role.name === SWEAR_EDITOR_ROLE)) return true;

    return false;
}