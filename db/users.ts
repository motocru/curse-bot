import { db } from './db';
import { getOrCreateServer } from './servers';
import { Server, User } from './dataTypes';

const getOrCreateUser = async (guildId: string, userId: string): Promise<User> => {
    const server = await getOrCreateServer(guildId);
    const user = server?.users.find(u => u.id === userId);
    if (user === undefined || user === null) {
        //create new user
        const newUserData: User = { id: userId, swears: {}};
        server.users = [...server.users, newUserData];
        await db?.collection<Server>(guildId)?.updateOne({_id: guildId}, {$set: {users: server.users}});
        return newUserData;
    } else {
        return user;
    }
}

export const totalUserSwearCount = async (guildId: string, userId: string): Promise<number> => {
    const user = await getOrCreateUser(guildId, userId);
    let swearCount: number = 0;
    for (const swear in user?.swears) {
        swearCount += user?.swears[swear] ?? 0;
    }
    return swearCount;
}

export const getUserSpecificSwearWordCount = async (guildId: string, userId: string, swearWord: string): Promise<number> => {
    const server = await getOrCreateServer(guildId);
    const user = server?.users.find(u => u.id === userId);
    return user?.swears[swearWord] ?? 0;
}

export const getUserSwearRecord = async (guildId: string, userId: string): Promise<Record<string, number>> => {
    const user = await getOrCreateUser(guildId, userId);
    return user?.swears ?? {};
}

export const addUserSwear = async (guildId: string, userId: string, curses: string[]) => {
    const user = await getOrCreateUser(guildId, userId);
    for (let i = 0; i < curses.length; i++) {
        if (user.swears[curses[i]] >= 1) {
            user.swears[curses[i]] += 1;
        } else {
            user.swears[curses[i]] = 1;
        }
    }
    const server = await getOrCreateServer(guildId);
    const updateIndex = server.users.findIndex(u => u.id === userId);
    server.users[updateIndex] = user;
    await db?.collection<Server>(guildId).updateOne({_id: guildId}, {$set: { users: server.users }});
    return user.swears;
}