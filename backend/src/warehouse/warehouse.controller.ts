import { Body, Controller, Get, Post } from "@nestjs/common";
import { WarehouseService } from "./warhouse.service.js";
import { Roles } from "../auth/decorators.js";
import { stockInDto } from "./warehouse.dto.js";


@Controller('warehouse')
export class WarehouseController {
    constructor(private warehouse: WarehouseService) {}



    @Roles('WH_MANAGER','WH_WORKER')
    @Get('bins') // ha ide nem irnek a () koze, /warehouse lenne az endpoint
    findBins() {
        return this.warehouse.findBins();
    }

    @Roles('WH_MANAGER')
    @Post('stock-in')
    stockIn(@Body() dto:stockInDto) {
        return this.warehouse.stockIn(dto.partId, dto.quanity);
    }
}
