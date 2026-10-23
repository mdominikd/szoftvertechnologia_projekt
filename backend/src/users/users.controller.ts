import { Body, Controller, Get, Post } from "@nestjs/common"
import { Roles } from "../auth/decorators.js"
import { createUserDto } from "./users.dto.js"
import { UserSertvice } from "./users.service.js"



@Roles('ADMIN') // csak adminok jogosuiltak az endpointokra :)
@Controller('users')
export class UsersController {
    constructor(private users: UserSertvice){}


    // GET /users
    @Get()
    findAll(){
        return this.users.findAll();
    }
    // POST /users
    @Post()
    create(@Body() dto: createUserDto) {
        return this.users.create(dto);
    }
}

