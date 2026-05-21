export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'contributor' | 'maintainer';
    created_at: 
}