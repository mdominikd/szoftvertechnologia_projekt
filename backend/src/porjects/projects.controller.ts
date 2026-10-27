import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { CurrentUser, type JwtUser, Roles } from "../auth/decorators.js";
import { ProjectsService} from './projects.service.js'
import { AddPartDto, CreateProjectDto, WorkDto } from "./projects.dto.js";


@Roles('SPECIALIST', 'ADMIN')
@Controller('projects')
export class ProjectController {
    constructor(private projects:ProjectsService) {}

    //GET /projects
    @Get()
    findAll(){
        return this.projects.findAll();
    }
    //POST /projects
    @Post()
    create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtUser) {
        return this.projects.create(dto, user.sub);
    }

    //GET /projects/:id projekt reszletek
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.projects.findOne(id);
    }

    @Post(':id/parts')
    addPart(@Param('id', ParseIntPipe) id: number, @Body() dto: AddPartDto) {
        return this.projects.addPart(id, dto)
    }

    @Patch(':id/work')
    setWork(@Param('id', ParseIntPipe) id: number, @Body() dto: WorkDto) {
        return this.projects.setWork(id, dto)
    }
}