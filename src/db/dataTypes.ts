export interface Server {
    _id: string;
    users: User[];
    swears: string[];
    userMilestones: Record<string, number>;
    serverMilestones: Record<string, number>;
    firstCurseUserId: string | null;
}

export interface User {
    id: string;
    swears: Record<string, number>;
}