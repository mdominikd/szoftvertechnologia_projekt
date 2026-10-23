import { Module } from "@nestjs/common";
import { PartsController } from "./parts.controller.js";
import { PartService } from "./parts.service.js";


@Module({ controllers: [PartsController], providers: [PartService] })
export class PartsModule {}

