import 'dotenv/config';
import {PrismaMariaDb} from "@prisma/adapter-mariadb";

import { PrismaClient} from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

function random(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rnd = random(20261117);

const wanted: Record<string, number> = {
    'Napelem panel 450W': 12,
    'Invertor 5kW': 1,
    'Tarto konzol': 24,
    'sin': 12,
    'csatlakozo par': 30,
    'solar kabel 100m': 3,
    'DC megszakito': 2,
    'Akkumlator 10kWh': 2,
};

const target: Record<string, number> = {
    'Napelem panel 450W': 40,
    'Invertor 5kW': 6,
    'Tarto konzol': 120,
    'sin': 40,
    'csatlakozo par': 300,
    'solar kabel 100m': 15,
    'DC megszakito': 20,
    'Akkumlator 10kWh': 27,
};

await prisma.$transaction(async (tx) => {
    await tx.project.deleteMany({
        where: { location: 'Győr', customerName: 'Kovács Péter', status: 'SCHEDULED' },
    });

    const parts = await tx.part.findMany();
    const bins = await tx.bin.findMany();

    const totals = new Map<number, number>();
    for (const b of bins)
        if (b.partId && b.quanity > 0) totals.set(b.partId, (totals.get(b.partId) ?? 0) + b.quanity);
    for (const part of parts)
        totals.set(part.id, Math.max(totals.get(part.id) ?? 0, target[part.name] ?? 0));

    await tx.bin.updateMany({ data: { partId: null, quanity: 0 } });

    const free = bins.map((b) => b.id);
    for (let i = free.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [free[i], free[j]] = [free[j], free[i]];
    }

    for (const part of parts) {
        let left = totals.get(part.id) ?? 0;
        const low = Math.max(1, Math.floor(part.maxPerBin / 4));
        const high = Math.max(low, Math.floor(part.maxPerBin / 2));
        while (left > 0) {
            const id = free.pop();
            if (id === undefined) throw new Error('Nincs eleg rekesz');
            const chunk = Math.min(left, low + Math.floor(rnd() * (high - low + 1)));
            await tx.bin.update({ where: { id }, data: { partId: part.id, quanity: chunk } });
            left -= chunk;
        }
    }

    const reservedBy = new Map<number, number>();
    const reserving = await tx.projectPart.findMany({
        where: { project: { status: { in: ['DRAFT', 'WAIT', 'SCHEDULED'] } } },
    });
    for (const r of reserving) reservedBy.set(r.partId, (reservedBy.get(r.partId) ?? 0) + r.reserved);

    const items: { partId: number; quanity: number; reserved: number }[] = [];
    for (const part of parts) {
        const available = (totals.get(part.id) ?? 0) - (reservedBy.get(part.id) ?? 0);
        const quanity = Math.min(wanted[part.name] ?? 0, available);
        if (quanity > 0) items.push({ partId: part.id, quanity, reserved: quanity });
    }

    const specialist = await tx.user.findFirstOrThrow({ where: { role: 'SPECIALIST' } });
    const project = await tx.project.create({
        data: {
            location: 'Győr',
            description: 'Családi ház tetőre szerelt napelemes rendszer akkumulátorral',
            customerName: 'Kovács Péter',
            customerPhone: '+36 30 123 4567',
            customerEmail: 'kovacs.peter@example.com',
            status: 'SCHEDULED',
            workHours: 16,
            laborCost: 192000,
            createdById: specialist.id,
            parts: { create: items },
            statusLog: { create: [{ status: 'NEW' }, { status: 'DRAFT' }, { status: 'SCHEDULED' }] },
        },
    });

    console.log(`Raktar szetszorva, demo projekt: #${project.id} (${items.length} alkatresz)`);
}, { timeout: 60000 });

await prisma.$disconnect();
