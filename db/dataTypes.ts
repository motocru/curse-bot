export interface Server {
    _id: string;
    users: User[];
    firstCurseUserId: string;
}

export interface User {
    id: string;
    swears: Record<string, number>;
}