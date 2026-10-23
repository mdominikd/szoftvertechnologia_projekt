//global guard, minden keres elott lefut, es eldonti h tovabb mehet e, nicns passport!!!!!, csak bearer token ell


import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {JwtService} from '@nestjs/jwt'
import {Role} from '../generated/prisma/client.js'
import {JwtUser} from './decorators.js'
import { Observable } from 'rxjs'


@Injectable()
//imretarded
export class AuthGuard implements CanActivate{
    constructor(
        private jwt: JwtService,
        private reflector: Reflector, 
    ) {}


    //igazat ad, mehetunk tovabb, ha nem: 401, v 403
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const targets =[context.getHandler(), context.getClass()];
        if (this.reflector.getAllAndOverride<boolean>('isPublic', targets)) return true;

        const request =context.switchToHttp().getRequest();
        const [type, token] = (request.headers.authorization ?? '').split(' ');
        if(type  != 'Bearer' || !token) throw new UnauthorizedException('bejelentkezes szukseges!!!');
        try{
            request.user = await this.jwt.verifyAsync<JwtUser>(token);
        } catch {
            throw new UnauthorizedException('ervenztelen vagy lejart token!!');
        }

        const roles = this.reflector.getAllAndOverride<Role[]>('roles',targets);
        if(roles && !roles.includes(request.user.role)) throw new ForbiddenException("nincs jogosultsagod!");
        return true;
    }
}



