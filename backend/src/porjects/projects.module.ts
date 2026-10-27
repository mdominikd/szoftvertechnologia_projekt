import { Module } from "@nestjs/common";
import { ProjectController } from "./projects.controller.js";
import { ProjectsService } from "./projects.service.js";

@Module({ controllers: [ProjectController], providers: [ProjectsService], exports: [ProjectsService]})
export class ProjectModule {}