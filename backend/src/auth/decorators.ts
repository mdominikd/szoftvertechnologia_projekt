//jogosultsag kezeles nestjs el


import {createParamDecorator, ExecutionContext, SetMetadata} from '@nestjs/common';
import { Role } from '../generated/prisma/client.js';

//request.user
export type JwtUser = { sub: number; name: string; role:  Role}



// public endpoint, no auth
export const Public = ()=> SetMetadata('isPublic', true);

// szerepkor alapu roles guard
// pl @Roles('ADMIN'...)
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// bejelentkezett felhasnalot adja a controller meth paramba
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext):JwtUser => ctx.switchToHttp().getRequest().user,
);
