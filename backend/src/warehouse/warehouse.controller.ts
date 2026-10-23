import { Controller, Get } from "@nestjs/common";
import { WarehouseService } from "./warhouse.service.js";
import { Roles } from "../auth/decorators.js";


@Controller('warehouse')
export class WarehouseController {
    constructor(private warehouse: WarehouseService) {}



    @Roles('WH_MANAGER','WH_WORKER')
    @Get('bins') // ha ide nem irnek a () koze, /warehouse lenne az endpoint
    findBins() {
        return this.warehouse.findBins();
    }
}
