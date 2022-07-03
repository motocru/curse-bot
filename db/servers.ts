import { db } from './db';
import { Server } from './dataTypes';

/**
 * Gets the total number of times any curse words were used on the server
 * @param guildId Id of the server being getting all of the curse words selected
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

export const getServerSepecificSwearCount = async (guildId: string, swearWord: string): Promise<number> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    let swearCount = 0;
    server?.users.forEach(x => {
        swearCount += x?.swears[swearWord] ?? 0;
    });
    return swearCount;
}