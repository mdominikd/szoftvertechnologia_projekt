import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.service.js'
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './users/users.module.js';
import { PartsModule } from './parts/parts.module.js';
import { WarehouseModule } from './warehouse/warehouse.module.js';


@Module({
  imports: [PrismaModule, AuthModule, UserModule,PartsModule, WarehouseModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard}],
})
export class AppModule {}


