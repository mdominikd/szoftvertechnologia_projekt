//mintaadatok

import 'dotenv/config';
import {PrismaMariaDb} from "@prisma/adapter-mariadb";
import * as bcrypt from 'bcrypt';

import { PrismaClient} from '../src/generated/prisma/client.js';
import {binNumber, WAREHOUSE} from '../src/domain/warehouse.js';
import { planStockIn } from '../src/domain/stock.js';

const prisma = new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});


await prisma.pickItem.deleteMany();
await prisma.projectStatusLog.deleteMany();
await prisma.projectPart.deleteMany();
await prisma.project.deleteMany();
await prisma.bin.deleteMany();
await prisma.part.deleteMany();
await prisma.user.deleteMany();

const passwordHash = await bcrypt.hash('jelszo123', 10);
await prisma.user.createMany({
    data: [
        {
            name: 'Admin Dominik',
            email: 'admin@napelem.hu',
            role: 'ADMIN',
            passwordHash
        },
        {
            name: 'Szakember Szabolcs',
            email: 'szakember@napelem.hu',
            role: 'SPECIALIST',
            passwordHash
        },
        {
            name: 'Raktarvezeto Ritus',
            email: 'ritus@napelem.hu',
            role: 'WH_MANAGER',
            passwordHash
        },
        {
            name: 'Raktaros Luiz',
            email: 'luiz@napelem.hu',
            role: 'WH_WORKER',
            passwordHash
        },

    ],
});


const bins: {number: number; row: number; col:number; level:number} [] = [];
for (let row = 1; row <= WAREHOUSE.rows; row++)
    for (let col =1; col <= WAREHOUSE.cols; col++)
        for(let level=1; level <= WAREHOUSE.levels; level++)
            bins.push({ number: binNumber(row,col,level), row, col, level});
await prisma.bin.createMany({data: bins});


await prisma.part.createMany({
    data: [
        { name: 'Napelem panel 450W', price: 62000, maxPerBin: 10},
        { name: 'Invertor 5kW', price: 420000, maxPerBin: 2},
        { name: 'Tarto konzol', price: 5500, maxPerBin: 50},
        { name: 'sin', price: 6969, maxPerBin: 67},
        { name: 'csatlakozo par', price: 1200, maxPerBin: 100},
        { name: 'solar kabel 100m', price: 30000, maxPerBin: 5},
        { name: 'DC megszakito', price: 26262, maxPerBin: 30},
        { name: 'Akkumlator 10kWh', price: 1800000, maxPerBin: 1},
    ],
});

//kezdokeszlet

const initialStock: Record<string, number> = {
    'Napelem panel 450W': 33,
    'Invertor 5kW': 3,
    'Tarto konzol': 120,
    'sin': 30,
    'csatlakozo par': 90,
    'solar kabel 100m': 4,
    'DC megszakit': 10,
};

for(const part of await prisma.part.findMany()) {
    const quanity = initialStock[part.name];
    if(!quanity) continue;
    const free = await prisma.bin.findMany({where: {OR: [{ partId: part.id}, {partId: null}]}});
    for(const {binId, add} of  planStockIn(free, part.id, part.maxPerBin, quanity)) {
        await prisma.bin.update({
            where: {id: binId},
            data: { partId: part.id, quanity: { increment: add}}, 
        });
    }
}

console.log("Seed kesz.....")

await prisma.$disconnect();