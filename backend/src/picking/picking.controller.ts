import { Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { Roles } from "../auth/decorators.js";
import { PickingService } from "./picking.service.js";

@Roles('WH_WORKER')
@Controller('picking')
export class PickignController {
    constructor(private picking: PickingService) {}


    @Get('projects')
    listProjects() {
        return this.picking.listProjects();
    }

    @Post(':projectId/start')
    start(@Param('projectId', ParseIntPipe) projectId: number) {
        return this.picking.start(projectId);
    }

    @Get(':projectId')
    route(@Param('projectId', ParseIntPipe) projectId: number) {
        return this.picking.rt(projectId);
    }
}