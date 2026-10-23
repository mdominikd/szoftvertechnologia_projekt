// felhasnalok db kapcs
// pl osszes lekerdezes


import {ConflictException, Injectable} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service.js';
import { createUserDto } from './users.dto.js';

// ezek kerulenk a valsszba pwdhash soha.
const publicFields = {id: true, name:true, email:true, role: true};

@Injectable()
export class UserSertvice {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.user.findMany({
            select: publicFields,
            orderBy: {name: "asc"},
        });
    }
    async create(dto:createUserDto) {
        if( await this.prisma.user.findUnique({where: {email: dto.email} })) {
            throw new ConflictException('ez az emailcim mar foglalva van'); //409 :))
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {name : dto.name, email: dto.email, role: dto.role, passwordHash},
            select: publicFields,
        });
    }
}