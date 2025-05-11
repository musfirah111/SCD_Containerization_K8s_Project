import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: string; // 'patient', 'doctor', or 'admin'
    token: string;
}

interface AuthContextProps {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    login: async () => { },
    logout: () => { },
    setUser: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user data from localStorage on app load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        if (token && role && userId && userName && userEmail) {
            setUser({ id: userId, name: userName, email: userEmail, role, token });
        }
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post<User>('http://localhost:5000/api/users/login', { email, password });
            const userData = response.data;

            // Debug log before storage
            console.log('About to store:', {
                id: userData.id,
                token: userData.token,
                role: userData.role
            });

            // Store values with explicit string conversion
            window.localStorage.setItem('userId', String(userData.id));
            window.localStorage.setItem('authToken', String(userData.token));
            window.localStorage.setItem('userRole', String(userData.role));
            window.localStorage.setItem('userName', String(userData.name));
            window.localStorage.setItem('userEmail', String(userData.email));

            // Verify storage
            console.log('After storage:', {
                storedId: localStorage.getItem('userId'),
                storedToken: localStorage.getItem('authToken'),
                storedRole: localStorage.getItem('userRole')
            });

            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                token: userData.token
            });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};