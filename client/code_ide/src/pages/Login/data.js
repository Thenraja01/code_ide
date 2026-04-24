// data.js - Temporary storage for user data
export const users = [];

export const saveUser = (userData) => {
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
