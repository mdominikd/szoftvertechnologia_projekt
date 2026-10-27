import { IsInt, Min } from "class-validator";

export class stockInDto {
    @IsInt() partId: number;
    @IsInt() @Min(1) quanity: number;
}