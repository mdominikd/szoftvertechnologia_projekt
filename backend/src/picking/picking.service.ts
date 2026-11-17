import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";
import { ProjectsService, Tx } from "../porjects/projects.service.js";
import { planPicking, type PickRequest } from "../domain/picking.js";
import { binLabel, sortRoute } from "../domain/warehouse.js";



@Injectable()
export class PickingService {
    constructor(
        private prisma: PrismaService,
        private projects: ProjectsService,
    ) {}

    listProjects() {
        return this.prisma.project.findMany({
            where: { status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED']}},
            orderBy: { createdAt : 'asc'},
        });
    }


    start(projectId: number) {
        return this.prisma.$transaction(async (tx) => {
            const project = await tx.project.findUnique({where: { id:projectId}, include: { parts: true}});
            if (!project) throw new NotFoundException('nincs ilyen projekt');
            if(project.status != 'SCHEDULED') throw new BadRequestException('csak scheDuled projeck indithato');

            const requests: PickRequest[] = [];
            for (const item of project.parts) {
                const bins = await tx.bin.findMany({ where: { partId: item.partId, quanity: { gt: 0}}});
                requests.push({ partId: item.partId, quanity: item.quanity, bins});
            }
            let planned;
            try {
                planned = planPicking(requests);
            } catch (error) {
                throw new BadRequestException((error as Error).message);
            }
            const stock = new Map(requests.flatMap((r) => r.bins).map((b) => [b.id, b] as const));
            for(const { partId, binId, take} of planned.lines) {
                const bin = stock.get(binId)!;
                const quanity = bin.quanity - take;
                await tx.bin.update({
                    where: {id: binId},
                    data: {quanity, partId:quanity===0? null: partId},
                });
                await tx.pickItem.create({data: {projectId, binId, partId, quanity: take}});
            }
            await this.projects.changeStatus(tx, projectId, 'IN_PROGRESS');
            return { length: Math.round(planned.length), baseline: Math.round(planned.baseline)};
        })
    }

    async rt(projectId: number, db: Tx = this.prisma) {
        const items = await db.pickItem.findMany({where: {projectId }, include: {bin: true, part: true}});
        const flat = items.map((i) => ({
            bin: binLabel(i.bin),
            row: i.bin.row,
            col: i.bin.col,
            level: i.bin.level,
            part: i.part.name,
            quanity: i.quanity,
        }));
        return sortRoute(flat).map((item, index) => ({ step: index +1, ...item}))
    }
}