import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";
import { ProjectsService, Tx } from "../porjects/projects.service.js";
import { pp } from "../domain/stock.js";
import { binLabel, sortRoute } from "../domain/warehouse.js";



@Injectable()
export class PickingService {
    constructor(
        private prisma: PrismaService,
        private projects: ProjectsService,
    ) {}

    listProjects() {
        return this.prisma.project.findMany({
            where: { status: { in: ['SCHEDULED', 'IN_PROGRESS']}},
            orderBy: { createdAt : 'asc'},
        });
    }


    start(projectId: number) {
        return this.prisma.$transaction(async (tx) => {
            const project = await tx.project.findUnique({where: { id:projectId}, include: { parts: true}});
            if (!project) throw new NotFoundException('nincs ilyen projekt');
            if(project.status != 'SCHEDULED') throw new BadRequestException('csak scheDuled projeck indithato');

            for (const item of project.parts) {
                const bins = await tx.bin.findMany({ where: { partId: item.partId}});
                let plan;
                try {
                    plan = pp(bins, item.quanity);
                } catch (error) {
                    throw new BadRequestException((error as Error).message);
                }
                for(const { binId, take} of plan) {
                    const bin= bins.find((b) => b.id===binId)!;
                    const quanity = bin.quanity - take;
                    //kikerult a rekesz, partid null lesz, igz mas alkatresz is kerulhet bele
                    await tx.bin.update({
                        where: {id: binId},
                        data: {quanity, partId:quanity===0? null: bin.partId},
                    });
                    await tx.pickItem.create({data: {projectId, binId, partId: item.partId, quanity: take}});
                }
            }
            await this.projects.changeStatus(tx, projectId, 'IN_PROGRESS');
            return;
        })
    }

    async rt(projectId: number, db: Tx = this.prisma) {
        const items = await db.pickItem.findMany({where: {projectId }, include: {bin: true, part: true}});
        const flat = items.map((i) => ({
            bin: binLabel(i.bin),
            row: i.bin.row,
            col: i.bin.row,
            level: i.bin.level,
            part: i.part.name,
            quanity: i.quanity,
        }));
        return sortRoute(flat).map((item, index) => ({ step: index +1, ...item}))
    }
}