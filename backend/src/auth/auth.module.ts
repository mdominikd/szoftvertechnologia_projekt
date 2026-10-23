import { Module} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
    imports: [
        JwtModule.registerAsync({
            global:true,
            useFactory:() => ({
                secret:process.env.JWT_SECRET,
                signOptions: {expiresIn: '8h'},
            }),
        }),
    ],
    controllers: [AuthController],
    providers:[AuthService],
})
export class AuthModule {}

