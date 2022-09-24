export interface Server {
    _id: string;
    users: User[];
    swears: string[];
    firstCurseUserId: string | null;
}

export interface User {
    id: string;
    swears: Record<string, number>;
}