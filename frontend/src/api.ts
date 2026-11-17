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
    NEW: {label: 'Új', color: 'gray'},
    DRAFT: {label: 'Tervezet', color: 'blue'},
    WAIT: {label: 'Várakozik', color: 'yellow'},
    SCHEDULED: {label: 'Ütemezett', color: 'cyan'},
    IN_PROGRESS: {label: 'Folyamatban', color: 'indigo'},
    COMPLETED: {label: 'Befejezett', color: 'green'},
    FAILED: {label: 'Sikertelen', color: 'red'},
}

export const STATUS_ORDER: ProjectStatus[] = ['NEW', 'DRAFT', 'WAIT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];

export const EDITABLE: ProjectStatus[] = ['NEW', 'DRAFT', 'WAIT'];

export const NEXT_STEP: Record<ProjectStatus, string> = {
    NEW: 'Adj hozzá alkatrészeket, és add meg a becsült munkaórát.',
    DRAFT: 'Ha az alkatrészlista és a munkaóra kész, futtasd az árkalkulációt.',
    WAIT: 'Hiányzó alkatrész miatt vár. A bevételezés után futtasd újra az árkalkulációt.',
    SCHEDULED: 'Minden alkatrész lefoglalva. A raktáros indítja a kivételezést.',
    IN_PROGRESS: 'A kivételezés megtörtént. Zárd le a projektet, ha a munka kész.',
    COMPLETED: 'A projekt le van zárva.',
    FAILED: 'A projekt sikertelenként le van zárva.',
}

export function stepIndex(status: ProjectStatus): number {
    if (status === 'NEW') return 0;
    if (status === 'DRAFT' || status === 'WAIT') return 1;
    if (status === 'SCHEDULED') return 2;
    if (status === 'IN_PROGRESS') return 3;
    return 4;
}

export const huf = (n: number) => `${n.toLocaleString('hu-HU')} Ft`;

export type Role = 'ADMIN' | 'SPECIALIST' | 'WH_MANAGER'| 'WH_WORKER';
export type User = { id: number; name: string; email:string; role: Role};
export type Part = {
    id: number;
    name: string;
    price: number;
    maxPerBin: number;
    stock: number;
    reserved: number
    free: number
    demand: number;
};

export type Bin = {
    id: number
    number: number;
    row: number;
    col: number;
    level: number;
    quanity: number;
    part: { id: number; name: string} | null;
};

export const ROLE_NAMES: Record<Role, string> = {
    ADMIN: "Adminisztrátor",
    SPECIALIST: "Szakember",
    WH_MANAGER: "Raktárvezető",
    WH_WORKER: "Raktáros",
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

    if(res.status === 401 && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    const data= await res.json().catch(() => null);
    if(!res.ok) {
        const message = data?.message ?? `Hiba (${res.status})`;
        throw new Error(Array.isArray(message) ? message.join(', '): message);
    }
    return data as T;
}
