import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 1. CORS configuration
  // Enables the frontend (e.g., Vercel) to communicate with this backend
  app.enableCors(); 

  // 2. Swagger Configuration (API Documentation)
  // Define metadata that will be displayed in the documentation interface
  const config = new DocumentBuilder()
    .setTitle('EcoAir API')
    .setDescription('Official EcoAir API documentation. This interface allows for integration testing and endpoint validation for the air quality monitoring system.')
    .setVersion('1.0')
    // Tags help organize endpoints by modules in the Swagger UI
    .addTag('users', 'Account management and authentication')
    .addTag('stations', 'Environmental data synchronization and queries')
    .addTag('alerts-log', 'Health threshold management and alert logs')
    .addTag('health-profiles', 'User clinical profiles')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Set '/api' as the base path to access the documentation
  SwaggerModule.setup('api', app, document);

  // 3. Dynamic port for Render deployment
  // Render assigns a port automatically; if not present, defaults to 3000
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  
  logger.log(`EcoAir Backend is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();