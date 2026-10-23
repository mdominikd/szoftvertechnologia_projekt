//auth vegpont
//fogad http kereseket, es tovabbitja a service nek.

import {Body,Controller,Post} from '@nestjs/common';
import {IsEmail,IsString} from 'class-validator';
import {AuthService} from './auth.service.js';
import {Public} from './decorators.js';



class LoginDto {
    //szar a szerkezto, verified: npx tsc --noEmit -p tsconfig.json
    @IsEmail() email: string;
    @IsString() password: string;
}


@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    @Public()
    @Post('login')
    LoginDto(@Body() dto:LoginDto ){
        return this.auth.login(dto.email,dto.password)
    }
}
