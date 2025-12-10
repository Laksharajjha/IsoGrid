import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    name: string;
    role: 'ADMIN' | 'DOCTOR' | 'NURSE';
}

interface AuthContextType {
    user: User | null;
    login: (name: string, role: 'ADMIN' | 'DOCTOR' | 'NURSE') => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('isogrid_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (name: string, role: 'ADMIN' | 'DOCTOR' | 'NURSE') => {
        const newUser = { name, role };
        setUser(newUser);
        localStorage.setItem('isogrid_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('isogrid_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
