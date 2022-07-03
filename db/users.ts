import { db } from './db';
import { Server, User } from './dataTypes';

export const totalUserSwearCount = async (guildId: string, userId: string): Promise<number> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    let swearCount: number = 0;
    const user = server?.users.find(u => u.id === userId);
    for (const swear in user?.swears) {
        swearCount += user?.swears[swear] ?? 0;
    }
    return swearCount;
}

export const getUserSpecificSwearWordCount = async (guildId: string, userId: string, swearWord: string): Promise<number> => {
    const server = await db?.collection<Server>(guildId)?.findOne({_id: guildId});
    const user = server?.users.find(u => u.id === userId);
    return user?.swears[swearWord] ?? 0;
}