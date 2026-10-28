import { Module } from "@nestjs/common";
import { ProjectModule } from "../porjects/projects.module.js";
import { PickignController } from "./picking.controller.js";
import { PickingService } from "./picking.service.js";


@Module({ imports: [ProjectModule],controllers: [PickignController], providers: [PickingService]})
export class PickingModule {}