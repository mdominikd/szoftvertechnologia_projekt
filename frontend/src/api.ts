// egy kis fetch wrapper a backend hivasokhoz, plusz kozos adattipusok


const BASE_URL = 'http://127.0.0.1:3000';


export type ProjectStatus = 'NEW' | 'DRAFT' | 'WAIT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type Project = {
    id: number;
    location: string;
    description: string;

    customerName: string;
    customerPhone: string;
    customerEmail: string;
    status: ProjectStatus;
    workHours: number;
    laborCost: number;
    createdAt: string;
    createdBy ?: {name: string};
}

export type ProjectDetail = Project & {
    parts: {partId: number; quanity: number; reserved: number, part: {name: string; price:number}} [];
    statusLog: {id: number; status:ProjectStatus; changedAt: string}[];
}

export const STATUS: Record<ProjectStatus, {label: string; color:string}> = {
    NEW: {label: 'New', color: 'gray'},
    DRAFT: {label: 'Draft', color: 'blue'},
    WAIT: {label: 'Wait', color: 'orange'},
    SCHEDULED: {label: 'Scheduled', color: 'teal'},
    IN_PROGRESS: {label: 'InProgress', color: 'violet'},
    COMPLETED: {label: 'Completed', color: 'green'},
    FAILED: {label: 'Failed', color: 'red'},
}
export const huf = (n: number) => `${n.toLocaleString('hu-HU')} Ft`;

export type Role = 'ADMIN' | 'SPECIALIST' | 'WH_MANAGER'| 'WH_WORKER';
export type User = { id: number; name: string; email:string; role: Role};
export type Part = {
    id: number;
    name: string;
    price: number;
    maxPerBin: number;
    stock: number; // db a rekeszekben
    reserved: number // aktiv projektek altal lefoglalva
    free: number // szabad
    demand: number; // aktiv projektek teljes igenye
};

export type Bin = {
    id: number
    nubmer: number;
    row: number;
    col: number;
    level: number;
    quanity: number;
    part: { id: number; name: string} | null;
};

export const ROLE_NAMES: Record<Role, string> = {
    ADMIN: "Adminisztrator",
    SPECIALIST: "Specialista",
    WH_MANAGER: "Raktarvezeto",
    WH_WORKER: "Raktaros",
};


export async function api<T>(path: string, options: { method?: string; body?: unknown} = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(BASE_URL+path, {
        method: options.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`}: {}),
        },
        body: options.body === undefined ? undefined :  JSON.stringify(options.body),
    });
    
    //lejart vagy ervenytelen tokeneket kezelni kell (login redirect, ls clear)
    if(res.status === 401 && token) {
        localStorage.clear();
        window.location.href = '/login';
    }

    const data= await res.json().catch(() => null);
    if(!res.ok) {
        const message = data?.message ?? `Hiba (${res.status})`;
        throw new Error(Array.isArray(message) ? message.join(', '): message);
    }
    return data as T;
}



