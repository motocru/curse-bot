import { notStrictEqual } from "assert";
import { GuildMember } from "discord.js";

const SWEAR_EDITOR_ROLE = 'SWEAR EDITOR'

export async function canEditSwearList(member: GuildMember): Promise<boolean> {
    //I AM THE OWNER
    if (member.user.id === '345968473618382850') return true;

    const user = await member.guild?.members.fetch(member.user.id);
    for (const role of user?.roles.valueOf() ?? []) {
        const serverRole = await member.guild?.roles.fetch(role[0]);
        if (serverRole?.name?.toLocaleUpperCase() == SWEAR_EDITOR_ROLE) {
            return true;
        }
    }
    return false
}