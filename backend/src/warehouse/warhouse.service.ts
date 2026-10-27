import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";
import { planStockIn } from "../domain/stock.js";
import { binLabel } from "../domain/warehouse.js";
import { Tx } from "../porjects/projects.service.js";
import { stockInclude, withStock } from "../parts/parts.service.js";
import { RESERVING_STATUSES } from "../domain/status.js";

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

    stockIn(partId: number, quanity: number) {
        return this.prisma.$transaction(async(tx) => {
            const part = await tx.part.findUnique({ where: { id: partId}});
            if(!part) throw new NotFoundException('nincs ilyen alkatresz');
            const bins= await tx.bin.findMany({ where: { OR: [{ partId}, {partId: null}]}});


            let plan;
            try {
                plan = planStockIn(bins, partId, part?.maxPerBin, quanity);
            } catch (e) {throw new BadRequestException((e as Error).message);}

            const placements : { bin:string; add: number}[] = [];
            for (const {binId, add} of plan) {
                const bin = await tx.bin.update({
                    where: {id:binId},
                    data: { partId, quanity: { increment:add}}
                });
                placements.push({bin: binLabel(bin),add})
            }
            await this.fpreservations(tx, partId);
            return placements;

        });
    }

    async fpreservations(tx: Tx, partId: number) {
        const part = await tx.part.findUniqueOrThrow({ where: { id:partId}, include: stockInclude});
        let {free} = withStock(part);
        const items = await tx.projectPart.findMany({
            where: { partId, project: {status: { in: RESERVING_STATUSES}}},
            orderBy: {project: { createdAt: 'asc'}},
        });
        for(const item of items){
            const add = Math.min(item.quanity - item.reserved, free);
            if(add <= 0) continue; //ez a tetel amr teljesen levan foglalva v elfogyott
            await tx.projectPart.update({
                where: { projectId_partId: { projectId: item.projectId, partId}},
                data: {reserved: { increment: add}}
            })
            free -= add;
        }
    }
}


