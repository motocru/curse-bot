import { db } from './db';
import { Server } from './dataTypes';
import { Guild } from 'discord.js';

/**
 * Gets the total number of times any curse words were used on the server
 * @param guildId Id of the server getting all of the curse words selected
 * @returns number of times a curse word was uttered in a server
 */
export const serverSwearCount = async (guildId: string): Promise<number> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    let swearCount : number = 0;
    server?.users.forEach(x => { 
        for (const swear in x?.swears) {
            swearCount += x?.swears[swear] ?? 0;
        }
    });
    return swearCount;
}

/**
 * Gets the number of times a specific swear word ahs been used
 * @param guildId Id of the server being checked for swear count
 * @param swearWord swear word being chekced
 * @returns number of times a specific swear word was used
 */
export const getServerSepecificSwearCount = async (guildId: string, swearWord: string): Promise<number> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    let swearCount = 0;
    server?.users.forEach(x => {
        swearCount += x?.swears[swearWord] ?? 0;
    });
    return swearCount;
}

/**
 * Gets a record of each swear word used and the number of times used on a server
 * @param guildId Id of the server being checked
 * @returns Record of words used and their total uses
 */
export const getServerSwearTotal = async (guildId: string): Promise<Record<string, number>> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    let serverRecords: Record<string, number> = {};
    server?.users.forEach(x => {
        for (const swear in x?.swears) {
            serverRecords[swear] += x?.swears[swear] ?? 0;
        }
    });
    return serverRecords;
}

export const getServerSealBreaker = async (guildId: string): Promise<string | null> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    return server?.firstCurseUserId ?? null;
}

export const getServerCustomSwearList = async (guildId: string): Promise<string[]> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    return server?.swears ?? [];
}