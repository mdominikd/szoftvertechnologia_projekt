// bejelentkezes: jelszo ell, jwt token out 

import {Injectable,UnauthorizedException} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt' 
import {PrismaService} from '../prisma.service.js'
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService{
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService, 
    ) {}


    // login email + jelszo alapjan token
    async login(email: string, password:string){
        const user = await this.prisma.user.findUnique({ where: {email}});
        if(!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new UnauthorizedException('Hibas email vagy jelszo');
        }
        const token = await this.jwt.signAsync({
            sub:user.id,
            name: user.name,
            role: user.role,
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email:user.email,
                role: user.role,
            },
        }
    };
}

