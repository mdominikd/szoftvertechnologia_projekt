import { Controller, Get, Post,Body, Patch, Param, ParseIntPipe } from "@nestjs/common";
import { PartService } from "./parts.service.js";
import { Roles } from "../auth/decorators.js";
import { CreatePartDto, UpdatePartDto } from "./parts.dto.js";

@Controller('parts')
export class PartsController{
    constructor(private parts: PartService) {}

    //pbarki eleri tokennel
    @Get()
    findAll(){
        return this.parts.findAll();
    }


    @Roles('WH_MANAGER')
    @Post()
    create(@Body() dto: CreatePartDto) {
        return this.parts.create(dto);
    }


    //ParseIntPipe url bol szovegge, ha nem szam 400
    // ar, maxperbin
    @Roles('WH_MANAGER','ADMIN')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartDto){
        return this.parts.update(id, dto);
    }
}

