import { db } from './db';
import { Server } from './dataTypes';
import { totalUserSwearCount, getUserSpecificSwearWordCount } from './users';

export const getOrCreateServer = async (guildId: string): Promise<Server> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    if (server == null) {
        const newServerData: Server = {_id: guildId, users: [], swears: [], firstCurseUserId: null};
        await db?.collection<Server>(guildId).insertOne(newServerData)
        return newServerData;
    } else {
        return server;
    }
}

/**
 * Gets the total number of times any curse words were used on the server
 * @param guildId Id of the server getting all of the curse words selected
 * @returns number of times a curse word was uttered in a server
 */
export const serverSwearCount = async (guildId: string): Promise<number> => {
    const server = await getOrCreateServer(guildId);
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
    const server = await getOrCreateServer(guildId);
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
    const server = await getOrCreateServer(guildId);
    let serverRecords: Record<string, number> = {};
    server?.users.forEach(x => {
        for (const swear in x?.swears) {
            serverRecords[swear] += x?.swears[swear] ?? 0;
        }
    });
    return serverRecords;
}

/**
 * Returns the discord Id of who swore first on a server
 * @param guildId Id of the server being checked
 * @returns Id of the user who first swore on a server
 */
export const getServerSealBreaker = async (guildId: string): Promise<string | null> => {
    const server = await getOrCreateServer(guildId);
    return server?.firstCurseUserId ?? null;
}

/**
 * Retruns the list of custom swears a server has
 * @param guildId Id of the server being checked
 * @returns String list of custom swears added to a server
 */
export const getServerCustomSwearList = async (guildId: string): Promise<string[]> => {
    const server = await getOrCreateServer(guildId);
    return server?.swears ?? [];
}

/**
 * Adds a list of custom swears to a server and returns fully formed swear list
 * @param guildId Id of the server being checked
 * @param swears string array of swears to add to the server
 * @returns fully updated list of custom swears on a server
 */
export const addToServerCustomSwearList = async (guildId: string, swears: string[]): Promise<string[]> => {
    const server = await getOrCreateServer(guildId);
    const updatedSwears = [...server?.swears ?? [], ...swears];
    await db?.collection<Server>(guildId)?.updateOne({_id: guildId}, {$set: {swears: updatedSwears}});
    return updatedSwears ?? [];
}

/**
 * Gets a record of each user and the total number of times each has swore on the server
 * @param guildId Id of the server rankings being retrieved for
 * @returns Record of each user and the total amount of times a user swore
 */
export const getServerSwearUseRankings = async (guildId: string): Promise<Record<string, number>> => {
    const server = await getOrCreateServer(guildId);
    let userSwearTotals: Record<string, number> = {};
    server?.users.forEach(async user => {
        const usersSwears = await totalUserSwearCount(guildId, user.id);
        if (usersSwears > 0) userSwearTotals[user.id] = usersSwears;
    });
    return userSwearTotals;
}

/**
 * Gets a Record of each user and the total number of times each has used the given curse word
 * @param guildId Id of the server rankings being retrieved for
 * @param curse specific curse word being grabbed
 * @returns record of users who have used the given word and the number of times they have used it
 */
export const getServerSpecificSwearRankings = async (guildId: string, curse: string): Promise<Record<string, number>> => {
    const server = await getOrCreateServer(guildId);
    let userSwearTotals: Record<string, number> = {};
    server?.users.forEach(async user => {
        const userSwears = await getUserSpecificSwearWordCount(guildId, user.id, curse);
        if (userSwears > 0) userSwearTotals[user.id] = userSwears;
    });
    return userSwearTotals;
}