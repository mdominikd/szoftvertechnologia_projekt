import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class WarehouseService {
    constructor(private prisma: PrismaService) {}



    // osszes rekesz
    findBins() {
        return this.prisma.bin.findMany({
            include: { part: {select: { id: true, name: true}}},
            orderBy: { number: 'asc'}
        });
    }
}


