import { IsInt, IsString, Min, MinLength } from "class-validator";

export class CreateProjectDto {
    @IsString() @MinLength(1)   location: string;
    @IsString()                 description: string;
    @IsString() @MinLength(1)   customerName: string;
    @IsString()                 customerPhone: string;
    @IsString()                 customerEmail: string;

}

export class AddPartDto {
    @IsInt() partId: number;
    @IsInt() @Min(1) quanity: number;
}

export class WorkDto {
    @IsInt() @Min(0) workHours: number;
    @IsInt() @Min(0) laborCost: number;
}