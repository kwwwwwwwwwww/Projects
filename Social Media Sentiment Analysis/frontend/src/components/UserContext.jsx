import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUser({ username: storedUsername });
        }
    }, []);

    const login = (userData) => setUser(userData);
    const logout = () => {
        setUser(null);
        localStorage.removeItem('username');
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('REFRESH_TOKEN');
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
