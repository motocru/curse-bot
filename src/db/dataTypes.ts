export interface Server {
    _id: string;
    users: User[];
    swears: string[];
    userMilestones: Record<number, string>;
    serverMilestones: Record<number, string>;
    firstCurseUserId: string | null;
}

export interface User {
    id: string;
    swears: Record<string, number>;
}