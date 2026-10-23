import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller.js";
import { UserSertvice } from "./users.service.js";

@Module({ controllers: [UsersController], providers: [UserSertvice]})
export class UserModule {}

