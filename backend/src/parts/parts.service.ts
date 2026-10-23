// itt lesz a business logic, ugy kene h nem taroljuk kulon, hanem a rekezsekbol es a projekt tetelekbol sazmoljuk ki oket.
import { CreatePartDto, UpdatePartDto } from "./parts.dto.js"
import { RESERVING_STATUSES } from "../domain/status.js"
import { PrismaService } from "../prisma.service.js"
import { ConflictException, Injectable,NotFoundException } from "@nestjs/common"
import { Prisma } from "../generated/prisma/client.js"
export const stockInclude = {
    bins: {select: {quantity: true}},
    projectParts: { where: {project: {status: { in: RESERVING_STATUSES}}}},
} satisfies Prisma.PartInclude;


type PartWithRelations = {
    id: number;
    name: string;
    price: number;
    maxPerBin: number;
    bins: {quantity: number } [];
    projectParts: {quantity: number; reserved: number} [];
}

//withStock
export function withStock({bins, projectParts, ...part}: PartWithRelations) {
    const stock = bins.reduce((sum, b) => sum +b.quantity, 0);
    const reserved = projectParts.reduce((sum, pp) => sum+pp.reserved, 0);
    const demand= projectParts.reduce((sum,pp) => sum+pp.quantity, 0);
    return {...part, stock, reserved, free: stock - reserved, demand};
}

@Injectable()
export class PartService {
    constructor(private prisma: PrismaService) {}

    //lista alkatresz listazasa (faradt bagyo kmar mitn az allat)
    async findAll() {
        const parts = await this.prisma.part.findMany({
            include: stockInclude,
            orderBy: { name:'asc'},
        });
        return parts.map(withStock);
    }

    //create uj alkatresz
    async create(dto: CreatePartDto) { 
        if(await this.prisma.part.findUnique({where: {name: dto.name}})) {
            throw new ConflictException('izlen nevu  alkatresz mar letezik')
        }
        return this.prisma.part.create({data: dto })
    }
        


    //update ar modositas
    async update(id: number, dto: UpdatePartDto) {
        const part = await this.prisma.part.findUnique({where: {id}});
        if(!part) throw new NotFoundException('nincs ilyen alkatresz');
        return this.prisma.part.update({where: { id}, data: dto});
    }
}





