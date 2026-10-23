//mintaadatok

import 'dotenv/config';
import {PrismaMariaDb} from "@prisma/adapter-mariadb";
import * as bcrypt from 'bcrypt';

import { PrismaClient} from '../src/generated/prisma/client.js';
import {binNumber, WAREHOUSE} from '../src/domain/warehouse.js';

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

console.log('seed elkeszult, 4 user, 240 rekesz, 8 alkatresz');

await prisma.$disconnect();