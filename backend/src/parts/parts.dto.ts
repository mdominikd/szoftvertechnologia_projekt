import { IsString, IsInt,MinLength, Min, IsOptional } from "class-validator";

export class CreatePartDto {
    @IsString() @MinLength(1) name: string;
    @IsInt() @Min(0) price: number;
    @IsInt() @IsInt() @Min(1) maxPerBin: number;
}


export class UpdatePartDto {
    // @IsOptional() a user ha modositani akar akkro csak azokat a mezoket kudli amiket valtoztatni akar
    @IsOptional() @IsInt() @Min(0) price?: number;
    @IsOptional() @IsInt() @Min(1) maxPerBin?: number;}




