// data.ts - Temporary storage for user data
export interface UserData {
    id: string;
    name: string;
    password?: string;
    email: string;
}

export const users: UserData[] = [];

export const saveUser = (userData: UserData) => {
    // Check if user already exists
    const exists = users.find(u => u.email === userData.email);
    if (!exists) {
        users.push(userData);
        console.log("User saved to temporary data store:", userData);
    }
};

export const getUsers = () => {
    return users;
};
