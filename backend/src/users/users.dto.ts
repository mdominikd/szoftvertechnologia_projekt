import { Role } from "../generated/prisma/client.js";
import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";



export class createUserDto {
    @IsString() name: string;
    @IsEmail() email: string;
    @IsString() @MinLength(6) password: string;
    @IsEnum(Role) role: Role;
}

