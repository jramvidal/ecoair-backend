import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// Cambiamos el import por require para evitar errores de tipado en la función
const request = require('supertest'); 

import { StationsController } from './../src/stations/stations.controller';
import { StationsService } from './../src/stations/stations.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockStationsService = {
    findAll: () => [{ id: 1, name: 'Estación Test E2E', aqi: 10 }],
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StationsController],
      providers: [
        {
          provide: StationsService,
          useValue: mockStationsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Cerramos la app correctamente al terminar
    if (app) {
      await app.close();
    }
  });

  it('/stations (GET)', () => {
    // Ahora 'request' debería ser reconocido como una función sin problemas
    return request(app.getHttpServer())
      .get('/stations')
      .expect(200)
      .expect(mockStationsService.findAll());
  });
});