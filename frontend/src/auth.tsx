//react context el bejelentkezesi allapot.

import { createContext, useContext, useState,  type ReactNode }from "react"; 
import {api, type User } from './api'

// useState nem hasznalok soha egy nagy szar senki ne hasznalja,
//  de most leszarom nicns idom

type AuthValue = {
    user: User | null;
    login: (email:string, password: string) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthValue>(null!);

export function AuthProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<User | null> (() => JSON.parse(localStorage.getItem('user') ?? 'null'));        

    async function login(email: string, password: string) {
        const res= await api<{token: string; user: User}>('/auth/login', {
            method: 'POST',
            body: {email,password},
        });
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        return res.user;
    }


    //logout
    function logout() {
        localStorage.clear();
        setUser(null);
    }


    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext);

