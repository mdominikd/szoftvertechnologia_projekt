import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

const app = await NestFactory.create(AppModule);

app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true}));
app.enableCors();


const config = new DocumentBuilder()
  .setTitle('napelem api')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .build();
SwaggerModule.setup('api',app, () => SwaggerModule.createDocument(app,config));

await app.listen(process.env.PORT??3000);


