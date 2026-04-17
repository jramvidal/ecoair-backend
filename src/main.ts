import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 1. CORS configuration
  app.enableCors(); 

  // 2. Dynamic port for Render
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  
  logger.log(`EcoAir Backend is running on: http://localhost:${port}`);
}
bootstrap();