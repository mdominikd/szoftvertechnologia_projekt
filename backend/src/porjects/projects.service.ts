import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProjectStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma.service.js";
import { AddPartDto, CreateProjectDto, WorkDto } from "./projects.dto.js";
import { canTransition, EDITABLE_STATUSES } from "../domain/status.js";
import { stockInclude, withStock } from "../parts/parts.service.js";

export type Tx = Prisma.TransactionClient;


@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) {}

    create(dto: CreateProjectDto, userId: number){
        return this.prisma.project.create({
            data: {...dto, createdById: userId, statusLog: {create: { status: 'NEW'}}},
        })
    }


    findAll() {
        return this.prisma.project.findMany({
            include: { createdBy: {select: { name:true}}},
            orderBy: { createdAt:'desc'},
        });
    }

    async findOne(id: number) { 
        const project = await this.prisma.project.findUnique({
            where: {id},
            include: {
                parts: { include: { part: true}, orderBy: {partId: 'asc'}},
                statusLog: { orderBy:{ id: 'asc'}}
            },
        });
        if (!project) throw new NotFoundException('Nincs ilyen projekt');
        return project
    }


    //minden allapotvaltas csak ezen a fuggvenyen kereszxtul tortenhet, hogy midnig naplozzunk. 
    //azonos allapotnal nem csinal semmit
    async changeStatus(tx: Tx, projectId: number, to:ProjectStatus) {
        const { status} = await tx.project.findFirstOrThrow({ where: { id:projectId}});
        if(status === to) return;
        if(!canTransition(status,to))
            throw new BadRequestException(`newm megengedett allapotvaltas: ${status} -> ${to}`);
        await tx.project.update({where: { id: projectId}, data: { status: to}});
        await tx.projectStatusLog.create({ data: { projectId, status: to}});
    }

    addPart(projectId: number, dto: AddPartDto){ 
        return this.prisma.$transaction(async (tx) =>{
            await this.assertEditable(tx, projectId);
            const part = await tx.part.findUnique({ where: {id: dto.partId},include: stockInclude});
            if(!part) throw new NotFoundException('ilyen alkatresz nincs');
            const {free} = withStock(part);

            const key = { projectId_partId: {projectId, partId: dto.partId}};
            const existing = await tx.projectPart.findUnique({where: key });
            const quanity = (existing?.quanity ?? 0) + dto.quanity; //ugyan az az alkatrsz, akkor a mennyiseg no
            const alreadyReserved = existing?.reserved ?? 0;
            const reserved = alreadyReserved +Math.min(quanity - alreadyReserved, Math.max(free, 0));

            await tx.projectPart.upsert({
                where: key,
                create: { projectId, partId:dto.partId, quanity, reserved},
                update: {quanity, reserved},
            });
            await this.changeStatus(tx,projectId, 'DRAFT');
            return {quanity, reserved, preserverd:  quanity - reserved};
            
        });
    }
    // becsult munka ido es ora rogzitese
    async setWork(projectId: number, dto:WorkDto) {
        await this.assertEditable(this.prisma, projectId);
        return this.prisma.project.update({ where: { id: projectId}, data:dto});
    }



    private async assertEditable(tx:Tx, projectId: number) {
        const project = await tx.project.findUnique({where: { id: projectId}});
        if(!project) throw new NotFoundException('nincs ilyen projekt');
        if(!EDITABLE_STATUSES.includes(project.status)) {
            throw new BadRequestException('a project ebben az allapotaban nem modosithato');
        }
    }
}